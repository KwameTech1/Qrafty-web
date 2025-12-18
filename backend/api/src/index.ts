import path from "node:path";

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
import { publicRouter } from "./routes/public";
import { qrCardsRouter } from "./routes/qrCards";

const envPath = path.resolve(__dirname, "..", ".env");
const dotenvResult = dotenv.config({ path: envPath });

// eslint-disable-next-line no-console
console.log(
  `[env] loadedFrom=${envPath} ok=${!dotenvResult.error} keys=${
    dotenvResult.parsed ? Object.keys(dotenvResult.parsed).length : 0
  }`
);

if (dotenvResult.error) {
  // eslint-disable-next-line no-console
  console.warn(`[env] dotenv error: ${dotenvResult.error.message}`);
}

const env = getEnv();

const app = express();

app.use(helmet());
applySecurity(app);
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/auth", authRouter(env));
app.use("/analytics", analyticsRouter(env));
app.use("/dashboard", dashboardRouter(env));
app.use("/interactions", interactionsRouter(env));
app.use("/inventory", inventoryRouter(env));
app.use("/marketplace", marketplaceRouter(env));
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
    envLoadedOk: !dotenvResult.error,
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

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);

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
