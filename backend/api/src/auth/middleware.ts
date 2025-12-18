import type { NextFunction, Request, Response } from "express";

import type { Env } from "../env";
import { getAuthCookieName, verifyAuthToken } from "./jwt";

export type AuthenticatedRequest = Request & { userId: string };

function readBearerToken(req: Request) {
  const header = req.header("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function getOptionalUserId(env: Env, req: Request): string | null {
  try {
    const token = req.cookies?.[getAuthCookieName()] ?? readBearerToken(req);
    if (!token) return null;
    const payload = verifyAuthToken(env, token);
    return payload.sub;
  } catch {
    return null;
  }
}

export function requireAuth(env: Env) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = getOptionalUserId(env, req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    (req as AuthenticatedRequest).userId = userId;
    return next();
  };
}
