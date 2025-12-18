import type { Express } from "express";
import rateLimit from "express-rate-limit";

export function applySecurity(app: Express) {
  app.disable("x-powered-by");

  // Global rate limit to protect against basic abuse.
  // Tune as you observe traffic.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
}
