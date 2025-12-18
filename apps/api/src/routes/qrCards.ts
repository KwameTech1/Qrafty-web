import crypto from "node:crypto";

import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import type { Env } from "../env";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

const createSchema = z.object({
  label: z.string().trim().min(1).max(60),
});

const updateSchema = z.object({
  label: z.string().trim().min(1).max(60).optional(),
  isActive: z.boolean().optional(),
});

function newPublicId() {
  return crypto.randomBytes(9).toString("base64url");
}

export function qrCardsRouter(env: Env) {
  const router = Router();

  router.get("/", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;
    const items = await prisma.qRCard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        publicId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ items });
  });

  router.post("/", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });

    const card = await prisma.qRCard.create({
      data: {
        userId,
        label: parsed.data.label,
        publicId: newPublicId(),
      },
      select: {
        id: true,
        label: true,
        publicId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({ item: card });
  });

  router.patch(
    "/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: "Invalid input" });

      const id = req.params.id;

      const existing = await prisma.qRCard.findFirst({ where: { id, userId } });
      if (!existing) return res.status(404).json({ error: "Not found" });

      const card = await prisma.qRCard.update({
        where: { id },
        data: {
          ...(parsed.data.label !== undefined
            ? { label: parsed.data.label }
            : {}),
          ...(parsed.data.isActive !== undefined
            ? { isActive: parsed.data.isActive }
            : {}),
        },
        select: {
          id: true,
          label: true,
          publicId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json({ item: card });
    }
  );

  router.delete(
    "/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const id = req.params.id;

      const existing = await prisma.qRCard.findFirst({ where: { id, userId } });
      if (!existing) return res.status(404).json({ error: "Not found" });

      await prisma.qRCard.delete({ where: { id } });
      return res.status(204).send();
    }
  );

  return router;
}
