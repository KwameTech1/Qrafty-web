import path from "node:path";
import fs from "node:fs";

import dotenv from "dotenv";

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { getEnv } from "./env";
import { applySecurity } from "./middleware/security";
import { authRouter } from "./routes/auth";
import { analyticsRouter } from "./routes/analytics";
import { dashboardRouter } from "./routes/dashboard";
import { interactionsRouter } from "./routes/interactions";
import { inventoryRouter } from "./routes/inventory";
import { marketplaceRouter } from "./routes/marketplace";
import { profileRouter } from "./routes/profile";
import { publicRouter } from "./routes/public";
import { qrCardsRouter } from "./routes/qrCards";

const envPath = path.resolve(__dirname, "..", ".env");
const hasDotEnv = fs.existsSync(envPath);
const dotenvResult = hasDotEnv ? dotenv.config({ path: envPath }) : null;

// eslint-disable-next-line no-console
console.log(
  `[env] loadedFrom=${envPath} exists=${hasDotEnv} ok=${
    dotenvResult ? !dotenvResult.error : true
  } keys=${dotenvResult?.parsed ? Object.keys(dotenvResult.parsed).length : 0}`
);

const env = getEnv();

function normalizeOrigin(origin: string) {
  return new URL(origin).origin;
}

function parseOriginList(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return normalizeOrigin(origin);
      } catch {
        return null;
      }
    })
    .filter((origin): origin is string => Boolean(origin));
}

function isPrivateIp(hostname: string) {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname === "::1") return true;

  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

  const [a, b] = nums;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function buildCorsOriginChecker() {
  const configured = parseOriginList(env.WEB_ORIGINS ?? env.WEB_ORIGIN);
  const allowLanInDev = env.NODE_ENV !== "production";

  return (
    origin: string | undefined,
    callback: (err: Error | null, ok?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);

    try {
      const normalized = normalizeOrigin(origin);
      if (configured.includes(normalized)) return callback(null, true);

      if (allowLanInDev) {
        const url = new URL(origin);
        if (url.protocol === "http:" && isPrivateIp(url.hostname)) {
          return callback(null, true);
        }
      }
    } catch {
      // ignore
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  };
}

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
applySecurity(app);
app.use(cors({ origin: buildCorsOriginChecker(), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/auth", authRouter(env));
app.use("/analytics", analyticsRouter(env));
app.use("/dashboard", dashboardRouter(env));
app.use("/interactions", interactionsRouter(env));
app.use("/inventory", inventoryRouter(env));
app.use("/marketplace", marketplaceRouter(env));
app.use("/profile", profileRouter(env));
app.use("/qr-cards", qrCardsRouter(env));
app.use("/public", publicRouter());

app.get("/health", (_req, res) => {
  const googleOAuthConfigured = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URL
  );

  res.json({
    ok: true,
    googleOAuthConfigured,
    envLoadedFrom: envPath,
    envLoadedOk: dotenvResult ? !dotenvResult.error : true,
    googleEnv: {
      hasClientId: Boolean(env.GOOGLE_CLIENT_ID),
      hasClientSecret: Boolean(env.GOOGLE_CLIENT_SECRET),
      hasRedirectUrl: Boolean(env.GOOGLE_REDIRECT_URL),
    },
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(env.PORT, env.HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://${env.HOST}:${env.PORT}`);

  // eslint-disable-next-line no-console
  console.log(
    `Google OAuth configured: ${
      env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET &&
      env.GOOGLE_REDIRECT_URL
        ? "yes"
        : "no"
    }`
  );
});
