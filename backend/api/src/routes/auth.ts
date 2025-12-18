import crypto from "crypto";

import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import type { Env } from "../env";
import {
  getOptionalUserId,
  requireAuth,
  type AuthenticatedRequest,
} from "../auth/middleware";
import {
  buildAuthCookieOptions,
  getAuthCookieName,
  signAuthToken,
} from "../auth/jwt";
import { hashPassword, verifyPassword } from "../auth/password";

const emailPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

function publicUser(user: {
  id: string;
  email: string;
  displayName: string | null;
}) {
  return { id: user.id, email: user.email, displayName: user.displayName };
}

function ensureGoogleEnv(env: Env) {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REDIRECT_URL
  ) {
    return null;
  }
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUrl: env.GOOGLE_REDIRECT_URL,
  };
}

export function authRouter(env: Env) {
  const router = Router();

  router.post("/signup", async (req: Request, res: Response) => {
    const parsed = emailPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists" });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
      },
      select: { id: true, email: true, displayName: true },
    });

    const token = signAuthToken(env, { sub: user.id });
    res.cookie(getAuthCookieName(), token, buildAuthCookieOptions(env));

    return res.status(201).json({ token, user: publicUser(user) });
  });

  router.post("/login", async (req: Request, res: Response) => {
    const parsed = emailPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        error: "This account uses Google sign-in. Use Continue with Google.",
      });
    }

    const ok = await verifyPassword(user.passwordHash, parsed.data.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signAuthToken(env, { sub: user.id });
    res.cookie(getAuthCookieName(), token, buildAuthCookieOptions(env));

    return res.json({
      token,
      user: publicUser({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      }),
    });
  });

  router.get("/me", async (req: Request, res: Response) => {
    const userId = getOptionalUserId(env, req);
    if (!userId) {
      return res.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true },
    });

    if (!user) {
      return res.json({ user: null });
    }

    return res.json({ user: publicUser(user) });
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie(getAuthCookieName(), { path: "/" });
    return res.status(204).send();
  });

  // Google OAuth
  router.get("/google/start", (req, res) => {
    const google = ensureGoogleEnv(env);
    if (!google) {
      return res.redirect(
        `${env.WEB_ORIGIN}/login?error=google_not_configured`
      );
    }

    const state = crypto.randomBytes(32).toString("base64url");
    res.cookie("qrafty_oauth_state", state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 10,
    });

    const params = new URLSearchParams({
      client_id: google.clientId,
      redirect_uri: google.redirectUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(url);
  });

  router.get("/google/callback", async (req, res) => {
    const google = ensureGoogleEnv(env);
    if (!google) {
      return res.redirect(
        `${env.WEB_ORIGIN}/login?error=google_not_configured`
      );
    }

    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const expectedState = req.cookies?.qrafty_oauth_state ?? null;

    if (!code || !state || !expectedState || state !== expectedState) {
      return res.redirect(
        `${env.WEB_ORIGIN}/login?error=google_state_mismatch`
      );
    }

    res.clearCookie("qrafty_oauth_state", { path: "/" });

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: google.clientId,
          client_secret: google.clientSecret,
          redirect_uri: google.redirectUrl,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        return res.redirect(
          `${env.WEB_ORIGIN}/login?error=google_token_exchange_failed`
        );
      }

      const tokens = (await tokenResponse.json()) as {
        access_token?: string;
        id_token?: string;
      };

      if (!tokens.access_token) {
        return res.redirect(
          `${env.WEB_ORIGIN}/login?error=google_missing_access_token`
        );
      }

      const userinfoResponse = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: { authorization: `Bearer ${tokens.access_token}` },
        }
      );

      if (!userinfoResponse.ok) {
        return res.redirect(
          `${env.WEB_ORIGIN}/login?error=google_userinfo_failed`
        );
      }

      const profile = (await userinfoResponse.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
      };

      if (!profile.sub || !profile.email) {
        return res.redirect(
          `${env.WEB_ORIGIN}/login?error=google_profile_incomplete`
        );
      }

      const email = profile.email.toLowerCase();

      const byGoogleId = await prisma.user.findUnique({
        where: { googleId: profile.sub },
      });

      const user = byGoogleId
        ? await prisma.user.update({
            where: { id: byGoogleId.id },
            data: {
              email,
              emailVerified: Boolean(profile.email_verified),
              displayName: byGoogleId.displayName ?? profile.name ?? null,
            },
            select: { id: true, email: true, displayName: true },
          })
        : await prisma.user.upsert({
            where: { email },
            update: {
              googleId: profile.sub,
              emailVerified: Boolean(profile.email_verified),
              displayName: profile.name ?? undefined,
            },
            create: {
              email,
              googleId: profile.sub,
              emailVerified: Boolean(profile.email_verified),
              displayName: profile.name ?? null,
            },
            select: { id: true, email: true, displayName: true },
          });

      const token = signAuthToken(env, { sub: user.id });
      res.cookie(getAuthCookieName(), token, buildAuthCookieOptions(env));

      return res.redirect(`${env.WEB_ORIGIN}/`);
    } catch {
      return res.redirect(`${env.WEB_ORIGIN}/login?error=google_unknown`);
    }
  });

  return router;
}
