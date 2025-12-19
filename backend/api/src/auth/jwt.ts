import jwt from "jsonwebtoken";

import type { Env } from "../env";

export type AuthTokenPayload = {
  sub: string;
};

const COOKIE_NAME = "qrafty_auth";

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function signAuthToken(env: Env, payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(env: Env, token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string"
  ) {
    throw new Error("Invalid token");
  }
  return { sub: decoded.sub };
}

export function buildAuthCookieOptions(env: Env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}
