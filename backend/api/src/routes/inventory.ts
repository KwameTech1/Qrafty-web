import type { Request, Response } from "express";
import { Router } from "express";

import type { Env } from "../env";
import { prisma } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

export function inventoryRouter(env: Env) {
  const router = Router();

  router.get(
    "/qr-cards",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;

      const rows = await prisma.$queryRaw<
        Array<{
          id: string;
          label: string;
          publicId: string;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
          scans: number;
          contacts: number;
          lastActivityAt: Date | null;
        }>
      >`
        SELECT
          q."id" AS id,
          q."label" AS label,
          q."publicId" AS "publicId",
          q."isActive" AS "isActive",
          q."createdAt" AS "createdAt",
          q."updatedAt" AS "updatedAt",
          COALESCE(SUM(CASE WHEN i."type" = 'SCAN' THEN 1 ELSE 0 END), 0)::int AS scans,
          COALESCE(SUM(CASE WHEN i."type" = 'CONTACT' THEN 1 ELSE 0 END), 0)::int AS contacts,
          MAX(i."occurredAt") AS "lastActivityAt"
        FROM "QRCard" q
        LEFT JOIN "Interaction" i ON i."qrCardId" = q."id"
        WHERE q."userId" = ${userId}
        GROUP BY q."id", q."label", q."publicId", q."isActive", q."createdAt", q."updatedAt"
        ORDER BY q."createdAt" DESC;
      `;

      return res.json({ items: rows });
    }
  );

  // Add a new QR card (product)
  router.post(
    "/qr-cards",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { label, isActive } = req.body;
      if (!label || typeof label !== "string") {
        return res.status(400).json({ error: "Label is required" });
      }
      try {
        // Generate a unique publicId (could be random or based on label)
        const publicId = Math.random().toString(36).substring(2, 10);
        const card = await prisma.qRCard.create({
          data: {
            userId,
            label,
            publicId,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
          },
        });
        return res.status(201).json(card);
      } catch (err) {
        return res.status(500).json({ error: "Failed to add product" });
      }
    }
  );

  // Edit a QR card (product)
  router.put(
    "/qr-cards/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;
      const { label, isActive } = req.body;
      try {
        const card = await prisma.qRCard.findUnique({ where: { id } });
        if (!card || card.userId !== userId) {
          return res.status(404).json({ error: "Product not found" });
        }
        const updated = await prisma.qRCard.update({
          where: { id },
          data: {
            label: label !== undefined ? label : card.label,
            isActive:
              isActive !== undefined ? Boolean(isActive) : card.isActive,
          },
        });
        return res.json(updated);
      } catch (err) {
        return res.status(500).json({ error: "Failed to update product" });
      }
    }
  );

  // Delete a QR card (product)
  router.delete(
    "/qr-cards/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;
      try {
        const card = await prisma.qRCard.findUnique({ where: { id } });
        if (!card || card.userId !== userId) {
          return res.status(404).json({ error: "Product not found" });
        }
        await prisma.qRCard.delete({ where: { id } });
        return res.status(204).send();
      } catch (err) {
        return res.status(500).json({ error: "Failed to delete product" });
      }
    }
  );

  return router;
}
