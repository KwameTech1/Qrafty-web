import type { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import type { Env } from "../env";
import { prisma } from "../db";

export type AuthenticatedRequest = Request & { userId: string };

function getPrimaryEmailAddress(user: {
  primaryEmailAddressId?: string | null;
  emailAddresses?: Array<{ id: string; emailAddress: string }>;
}) {
  const emailAddresses = user.emailAddresses ?? [];
  if (emailAddresses.length === 0) return null;

  if (user.primaryEmailAddressId) {
    const primary = emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    if (primary?.emailAddress) return primary.emailAddress;
  }

  return emailAddresses[0]?.emailAddress ?? null;
}

function buildDisplayName(user: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const fullName = (user.fullName ?? "").trim();
  if (fullName) return fullName;
  const parts = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((v) => String(v).trim());
  return parts.length ? parts.join(" ") : null;
}

export async function getOptionalUserId(
  _env: Env,
  req: Request,
): Promise<string | null> {
  try {
    // Lightweight debug info to help diagnose authentication failures.
    // Do not log secrets or token values. Log only presence/keys.
    try {
      const hasAuthHeader = Boolean(req.headers.authorization);
      const cookieNames = Object.keys((req as any).cookies ?? {});
      // eslint-disable-next-line no-console
      console.debug(
        `[auth debug] hasAuthHeader=${hasAuthHeader} cookieCount=${cookieNames.length} cookieNames=${cookieNames.join(",") || "(none)"}`,
      );
    } catch (e) {
      // swallowing debug logging errors to avoid impacting auth flow
    }

    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    // eslint-disable-next-line no-console
    console.debug(`[auth debug] clerkUserId present=${Boolean(clerkUserId)}`);
    if (!clerkUserId) return null;

    const existing = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (existing) return existing.id;

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = getPrimaryEmailAddress(clerkUser)?.toLowerCase() ?? null;
    if (!email) return null;

    const displayName = buildDisplayName(clerkUser);

    const linked = await prisma.user.upsert({
      where: { email },
      update: {
        clerkUserId,
        displayName: displayName ?? undefined,
        emailVerified: true,
      },
      create: {
        email,
        clerkUserId,
        displayName,
        emailVerified: true,
      },
      select: { id: true },
    });

    return linked.id;
  } catch {
    return null;
  }
}

export function requireAuth(env: Env) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = await getOptionalUserId(env, req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    (req as AuthenticatedRequest).userId = userId;
    return next();
  };
}
