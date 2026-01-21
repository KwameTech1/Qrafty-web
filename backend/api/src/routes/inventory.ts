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
    },
  );

  // Add a new QR card (product)
  router.post(
    "/qr-cards",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { label, isActive } = req.body;

      // Validate input
      if (!label || typeof label !== "string" || label.trim().length === 0) {
        return res
          .status(400)
          .json({ error: "Label is required and must be a non-empty string" });
      }

      const trimmedLabel = label.trim();
      if (trimmedLabel.length > 100) {
        return res
          .status(400)
          .json({ error: "Label must be 100 characters or less" });
      }

      try {
        // Generate a unique publicId (could be random or based on label)
        const publicId = Math.random().toString(36).substring(2, 10);
        const card = await prisma.qRCard.create({
          data: {
            userId,
            label: trimmedLabel,
            publicId,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
          },
        });
        return res.status(201).json(card);
      } catch (err) {
        console.error("Failed to create QR card:", err);
        return res.status(500).json({ error: "Failed to create product" });
      }
    },
  );

  // Edit a QR card (product)
  router.put(
    "/qr-cards/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;
      const { label, isActive } = req.body;

      // Validate input
      if (label !== undefined) {
        if (typeof label !== "string" || label.trim().length === 0) {
          return res
            .status(400)
            .json({ error: "Label must be a non-empty string" });
        }
        if (label.trim().length > 100) {
          return res
            .status(400)
            .json({ error: "Label must be 100 characters or less" });
        }
      }

      try {
        const card = await prisma.qRCard.findUnique({ where: { id } });
        if (!card || card.userId !== userId) {
          return res.status(404).json({ error: "Product not found" });
        }

        const updateData: { label?: string; isActive?: boolean } = {};
        if (label !== undefined) updateData.label = label.trim();
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updated = await prisma.qRCard.update({
          where: { id },
          data: updateData,
        });
        return res.json(updated);
      } catch (err) {
        console.error("Failed to update QR card:", err);
        return res.status(500).json({ error: "Failed to update product" });
      }
    },
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
    },
  );

  return router;
}
