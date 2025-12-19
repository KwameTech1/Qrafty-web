import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import type { Env } from "../env";
import { prisma } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

const profilePatchSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional().nullable(),
  title: z.string().trim().max(80).optional().nullable(),
  company: z.string().trim().max(80).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  website: z.string().trim().url().optional().nullable(),
  bio: z.string().trim().max(800).optional().nullable(),
});

function normalizeOptionalString(value: string | null | undefined) {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function profileRouter(env: Env) {
  const router = Router();

  router.get("/me", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        title: true,
        company: true,
        phone: true,
        location: true,
        website: true,
        bio: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Not found" });

    return res.json({
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        title: user.title,
        company: user.company,
        phone: user.phone,
        location: user.location,
        website: user.website,
        bio: user.bio,
      },
    });
  });

  router.patch("/me", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const parsed = profilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const data = parsed.data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName !== undefined
          ? { displayName: normalizeOptionalString(data.displayName) }
          : {}),
        ...(data.title !== undefined
          ? { title: normalizeOptionalString(data.title) }
          : {}),
        ...(data.company !== undefined
          ? { company: normalizeOptionalString(data.company) }
          : {}),
        ...(data.phone !== undefined
          ? { phone: normalizeOptionalString(data.phone) }
          : {}),
        ...(data.location !== undefined
          ? { location: normalizeOptionalString(data.location) }
          : {}),
        ...(data.website !== undefined
          ? { website: normalizeOptionalString(data.website) }
          : {}),
        ...(data.bio !== undefined
          ? { bio: normalizeOptionalString(data.bio) }
          : {}),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        title: true,
        company: true,
        phone: true,
        location: true,
        website: true,
        bio: true,
      },
    });

    return res.json({
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        title: user.title,
        company: user.company,
        phone: user.phone,
        location: user.location,
        website: user.website,
        bio: user.bio,
      },
    });
  });

  return router;
}
