import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const mockupsDir = path.join(__dirname, "mockups");
const cssIn = path.join(mockupsDir, "_base.css");
const cssOut = path.join(mockupsDir, "mockups.css");
const framesDir = path.join(mockupsDir, "_frames");
const outVideo = path.join(webRoot, "public", "videos", "walkthrough.mp4");

const FPS = 24;
const CROSSFADE_FRAMES = 8;

const orderedScreens = [
  { file: "landing-hero.html", seconds: 2.6 },
  { file: "landing-options.html", seconds: 2.6 },
  { file: "signup.html", seconds: 2.6 },
  { file: "login.html", seconds: 2.6 },
  { file: "dashboard.html", seconds: 3.0 },
  { file: "qr-editor.html", seconds: 2.6 },
  { file: "interactions.html", seconds: 2.6 },
  { file: "inventory.html", seconds: 2.6 },
  { file: "public-profile.html", seconds: 2.6 },
  { file: "marketplace.html", seconds: 2.8 },
  { file: "business-profile.html", seconds: 2.8 },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function tryWhich(cmd) {
  const res = spawnSync("where", [cmd], { encoding: "utf8" });
  if (res.status === 0) {
    const first = res.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)[0];
    return first || null;
  }
  return null;
}

function findFfmpeg() {
  const fromEnv = process.env.FFMPEG_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  try {
    // Bundled ffmpeg avoids PATH differences between Git Bash/cmd/PowerShell.
    const installer = require("@ffmpeg-installer/ffmpeg");
    if (installer?.path && fs.existsSync(installer.path)) return installer.path;
  } catch {
    // ignore
  }

  const fromPath = tryWhich("ffmpeg.exe") || tryWhich("ffmpeg");
  if (fromPath) return fromPath;

  return null;
}

function buildMockupsCss() {
  const repoRoot = path.resolve(webRoot, "..", "..");
  const tailwindEntry = path.join(
    repoRoot,
    "node_modules",
    "@tailwindcss",
    "cli",
    "dist",
    "index.mjs"
  );

  const res = spawnSync(
    process.execPath,
    [tailwindEntry, "-i", "_base.css", "-o", "mockups.css"],
    {
      cwd: mockupsDir,
      stdio: "inherit",
    }
  );

  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error("Tailwind build failed");
}

async function renderFrames() {
  ensureDir(framesDir);

  // Clean old frames.
  if (fs.existsSync(framesDir)) {
    for (const entry of fs.readdirSync(framesDir)) {
      const full = path.join(framesDir, entry);
      if (fs.statSync(full).isFile() && entry.toLowerCase().endsWith(".png")) {
        safeUnlink(full);
      }
    }
  }

  const xfadeTmpDir = path.join(mockupsDir, "_xfade_tmp");
  ensureDir(xfadeTmpDir);

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    throw new Error(
      "ffmpeg not found. Install it (winget install --id Gyan.FFmpeg -e) or ensure it's on PATH."
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  // Cursor overlay must be re-injected for every navigation.
  await page.addInitScript({
    content: `
      (function () {
        function ensureCursor() {
          if (document.getElementById('mock-cursor')) return;

          const style = document.createElement('style');
          style.id = 'mock-cursor-style';
          style.textContent =
            "#mock-cursor{position:fixed;left:0;top:0;width:14px;height:14px;border-radius:9999px;border:2px solid rgba(37,99,235,.95);background:rgba(255,255,255,.95);box-shadow:0 8px 20px rgba(15,23,42,.25);transform:translate(-50%,-50%);z-index:2147483647;pointer-events:none}" +
            "#mock-cursor-ring{position:fixed;left:0;top:0;width:42px;height:42px;border-radius:9999px;border:2px solid rgba(37,99,235,.4);transform:translate(-50%,-50%) scale(.2);opacity:0;z-index:2147483646;pointer-events:none}" +
            "@keyframes mock-click{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}10%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}" +
            ".mock-click{animation:mock-click 320ms ease-out}";
          (document.head || document.documentElement).appendChild(style);

          const ring = document.createElement('div');
          ring.id = 'mock-cursor-ring';
          const cursor = document.createElement('div');
          cursor.id = 'mock-cursor';

          (document.body || document.documentElement).appendChild(ring);
          (document.body || document.documentElement).appendChild(cursor);

          window.__setMockCursor = (x, y) => {
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
            ring.style.left = x + 'px';
            ring.style.top = y + 'px';
          };

          window.__mockClick = () => {
            ring.classList.remove('mock-click');
            void ring.offsetWidth;
            ring.classList.add('mock-click');
          };
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', ensureCursor, { once: true });
        } else {
          ensureCursor();
        }

        window.__ensureMockCursor = ensureCursor;
      })();
    `,
  });

  let globalIndex = 1;
  let previousLastFrame = null;

  function writeCrossfade(fromPng, toPng) {
    for (let k = 1; k <= CROSSFADE_FRAMES; k += 1) {
      const alpha = k / (CROSSFADE_FRAMES + 1);
      const tmpOut = path.join(
        xfadeTmpDir,
        `xfade-${String(k).padStart(3, "0")}.png`
      );
      safeUnlink(tmpOut);

      const res = spawnSync(
        ffmpeg,
        [
          "-y",
          "-hide_banner",
          "-loglevel",
          "error",
          "-i",
          fromPng,
          "-i",
          toPng,
          "-filter_complex",
          `[0:v][1:v]blend=all_expr=A*(1-${alpha})+B*${alpha},format=rgb24`,
          "-frames:v",
          "1",
          tmpOut,
        ],
        { encoding: "utf8" }
      );

      if (res.status !== 0) {
        throw new Error(res.stderr || "ffmpeg crossfade failed");
      }

      const dest = path.join(
        framesDir,
        `${String(globalIndex).padStart(6, "0")}.png`
      );
      globalIndex += 1;
      fs.renameSync(tmpOut, dest);
    }
  }

  for (let i = 0; i < orderedScreens.length; i += 1) {
    const screen = orderedScreens[i];
    const htmlPath = path.join(mockupsDir, screen.file);
    const fileUrl = url.pathToFileURL(htmlPath).toString();

    await page.goto(fileUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => window.__ensureMockCursor?.());

    const target = await page.evaluate(() => {
      const selectors = [
        ".btn-primary",
        ".btn",
        "button",
        "a[href]",
        ".cta",
        ".card",
        ".phone",
      ];

      let el = null;
      for (const sel of selectors) {
        const found = document.querySelector(sel);
        if (found) {
          el = found;
          break;
        }
      }

      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.65,
        y: rect.top + rect.height * 0.55,
      };
    });

    const viewport = page.viewportSize() || { width: 1280, height: 720 };
    const targetX = clamp(
      target?.x ?? viewport.width * 0.62,
      40,
      viewport.width - 40
    );
    const targetY = clamp(
      target?.y ?? viewport.height * 0.56,
      40,
      viewport.height - 40
    );
    const startX = clamp(targetX - 220, 40, viewport.width - 40);
    const startY = clamp(targetY - 140, 40, viewport.height - 40);

    const screenFrames = Math.max(1, Math.round(screen.seconds * FPS));
    const clickFrame = Math.max(
      0,
      Math.min(screenFrames - 1, Math.floor(screenFrames * 0.68))
    );

    // First frame rendered to temp so we can insert a crossfade BEFORE it.
    const firstTemp = path.join(xfadeTmpDir, "__first.png");
    safeUnlink(firstTemp);

    await page.mouse.move(startX, startY);
    await page.evaluate(
      ({ x: xPos, y: yPos }) => window.__setMockCursor?.(xPos, yPos),
      { x: startX, y: startY }
    );
    await page.waitForTimeout(20);
    await page.screenshot({ path: firstTemp });

    if (previousLastFrame) {
      writeCrossfade(previousLastFrame, firstTemp);
    }

    const firstOut = path.join(
      framesDir,
      `${String(globalIndex).padStart(6, "0")}.png`
    );
    globalIndex += 1;
    fs.renameSync(firstTemp, firstOut);

    let lastOutPath = firstOut;

    for (let f = 1; f < screenFrames; f += 1) {
      const t = easeInOutCubic(f / (screenFrames - 1));
      const x = startX + (targetX - startX) * t;
      const y = startY + (targetY - startY) * t;

      await page.mouse.move(x, y);
      await page.evaluate(
        ({ x: xPos, y: yPos }) => window.__setMockCursor?.(xPos, yPos),
        { x, y }
      );

      if (f === clickFrame) {
        await page.mouse.down();
        await page.mouse.up();
        await page.evaluate(() => window.__mockClick?.());
      }

      await page.waitForTimeout(10);

      const outPath = path.join(
        framesDir,
        `${String(globalIndex).padStart(6, "0")}.png`
      );
      globalIndex += 1;
      await page.screenshot({ path: outPath });
      lastOutPath = outPath;
    }

    previousLastFrame = lastOutPath;
  }

  await browser.close();
}

function stitchVideo() {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    throw new Error(
      "ffmpeg not found. Install it (winget install --id Gyan.FFmpeg -e) or ensure it's on PATH."
    );
  }

  ensureDir(path.dirname(outVideo));

  const inputPattern = `${framesDir.replace(/\\/g, "/")}/%06d.png`;

  const res = spawnSync(
    ffmpeg,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-framerate",
      String(FPS),
      "-start_number",
      "1",
      "-i",
      inputPattern,
      "-r",
      String(FPS),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-c:v",
      "libx264",
      "-crf",
      "22",
      outVideo,
    ],
    { encoding: "utf8" }
  );

  if (res.status !== 0) {
    throw new Error(res.stderr || "ffmpeg failed");
  }
}

async function main() {
  buildMockupsCss();
  await renderFrames();
  stitchVideo();

  const stat = fs.statSync(outVideo);
  console.log(`Generated: ${outVideo}`);
  console.log(`Size: ${stat.size} bytes`);
}

await main();
