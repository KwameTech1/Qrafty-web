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

  return router;
}
