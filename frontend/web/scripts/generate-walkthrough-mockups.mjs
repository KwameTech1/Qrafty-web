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
const concatFile = path.join(mockupsDir, "_concat.txt");
const outVideo = path.join(webRoot, "public", "videos", "walkthrough.mp4");

const FPS = 24;

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
    // Provides a platform-specific ffmpeg binary (e.g. ffmpeg.exe on Windows)
    // and avoids relying on PATH (which differs between Git Bash/cmd/PowerShell).
    const installer = require("@ffmpeg-installer/ffmpeg");
    if (installer?.path && fs.existsSync(installer.path)) {
      return installer.path;
    }
  } catch {
    // ignore
  }

  const fromPath = tryWhich("ffmpeg.exe") || tryWhich("ffmpeg");
  if (fromPath) return fromPath;

  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const candidate = path.join(
      localAppData,
      "Microsoft",
      "WinGet",
      "Packages"
    );

    if (fs.existsSync(candidate)) {
      const stack = [candidate];
      while (stack.length) {
        const current = stack.pop();
        if (!current) continue;
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (entry.name.toLowerCase().includes("node_modules")) continue;
            stack.push(full);
          } else if (
            entry.isFile() &&
            entry.name.toLowerCase() === "ffmpeg.exe"
          ) {
            return full;
          }
        }
      }
    }
  }

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

  const args = [tailwindEntry, "-i", "_base.css", "-o", "mockups.css"];

  const res = spawnSync(process.execPath, args, {
    cwd: mockupsDir,
    stdio: "inherit",
  });

  if (res.error) {
    throw res.error;
  }

  if (res.status !== 0) {
    throw new Error("Tailwind build failed");
  }
}

async function renderFrames() {
  ensureDir(framesDir);

  // Clean old frames to avoid mixing with new runs.
  if (fs.existsSync(framesDir)) {
    for (const entry of fs.readdirSync(framesDir)) {
      const full = path.join(framesDir, entry);
      if (fs.statSync(full).isFile() && entry.toLowerCase().endsWith(".png")) {
        fs.unlinkSync(full);
      }
    }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  // IMPORTANT: page.goto() replaces the whole document, so inject cursor
  // setup as an init script that runs for every navigation.
  await page.addInitScript({
    content: `
      (function () {
        function ensureCursor() {
          if (document.getElementById('mock-cursor')) return;

          const style = document.createElement('style');
          style.id = 'mock-cursor-style';
          style.textContent = \
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

  /** @type {{ path: string; duration: number }[]} */
  const frames = [];
  let globalIndex = 1;

  for (let i = 0; i < orderedScreens.length; i += 1) {
    const screen = orderedScreens[i];
    const htmlPath = path.join(mockupsDir, screen.file);
    const fileUrl = url.pathToFileURL(htmlPath).toString();

    await page.goto(fileUrl, { waitUntil: "networkidle" });

    // Ensure cursor overlay exists for this document.
    await page.evaluate(() => window.__ensureMockCursor?.());

    // Find a reasonable hover/click target on the screen.
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

    for (let f = 0; f < screenFrames; f += 1) {
      const t = screenFrames === 1 ? 1 : easeInOutCubic(f / (screenFrames - 1));
      const x = startX + (targetX - startX) * t;
      const y = startY + (targetY - startY) * t;

      await page.mouse.move(x, y);
      await page.evaluate(
        ({ x: xPos, y: yPos }) => {
          window.__setMockCursor?.(xPos, yPos);
        },
        { x, y }
      );

      // Give the browser a beat to paint the overlay before capturing.
      await page.waitForTimeout(10);

      if (f === clickFrame) {
        await page.mouse.down();
        await page.mouse.up();
        await page.evaluate(() => window.__mockClick?.());
      }

      const filename = `${String(globalIndex).padStart(6, "0")}.png`;
      globalIndex += 1;
      const outPath = path.join(framesDir, filename);
      await page.screenshot({ path: outPath });
      frames.push({ path: outPath, duration: 1 / FPS });
    }
  }

  await browser.close();

  return frames;
}

function buildConcatFile(frames) {
  const lines = [];

  for (const frame of frames) {
    lines.push(`file '${frame.path.replace(/\\/g, "/")}'`);
    lines.push(`duration ${frame.duration}`);
  }

  // concat demuxer needs the last file repeated without duration
  const last = frames[frames.length - 1];
  lines.push(`file '${last.path.replace(/\\/g, "/")}'`);

  fs.writeFileSync(concatFile, lines.join("\n"), "utf8");
}

function stitchVideo() {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    throw new Error(
      "ffmpeg not found. Install it (winget install --id Gyan.FFmpeg -e) or ensure it's on PATH."
    );
  }

  ensureDir(path.dirname(outVideo));

  const res = spawnSync(
    ffmpeg,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatFile,
      "-vsync",
      "vfr",
      "-r",
      "30",
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
  const frames = await renderFrames();
  buildConcatFile(frames);
  stitchVideo();

  const stat = fs.statSync(outVideo);
  // eslint-disable-next-line no-console
  console.log(`Generated: ${outVideo}`);
  // eslint-disable-next-line no-console
  console.log(`Size: ${stat.size} bytes`);
}

await main();
