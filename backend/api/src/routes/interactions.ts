import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import type { Env } from "../env";
import { prisma } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

const listQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 50))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 100, {
      message: "limit must be between 1 and 100",
    }),
  cursor: z.string().optional(),
});

export function interactionsRouter(env: Env) {
  const router = Router();

  router.get("/", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query" });
    }

    const limit = parsed.data.limit;
    const cursor = parsed.data.cursor;

    const items = await prisma.interaction.findMany({
      where: {
        qrCard: { userId },
      },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      select: {
        id: true,
        type: true,
        occurredAt: true,
        referrer: true,
        userAgent: true,
        qrCard: {
          select: { id: true, label: true, publicId: true },
        },
      },
    });

    const page = items.slice(0, limit);
    const nextCursor = items.length > limit ? page[page.length - 1]?.id : null;

    return res.json({ items: page, nextCursor });
  });

  return router;
}
