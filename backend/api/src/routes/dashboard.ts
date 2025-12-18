import type { Request, Response } from "express";
import { Router } from "express";

import { prisma } from "../db";
import type { Env } from "../env";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

export function dashboardRouter(env: Env) {
  const router = Router();

  router.get(
    "/overview",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;

      const [totalQrCards, totalInteractions, recentInteractions] =
        await Promise.all([
          prisma.qRCard.count({ where: { userId } }),
          prisma.interaction.count({ where: { qrCard: { userId } } }),
          prisma.interaction.findMany({
            where: { qrCard: { userId } },
            orderBy: { occurredAt: "desc" },
            take: 10,
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
          }),
        ]);

      return res.json({
        totals: {
          qrCards: totalQrCards,
          interactions: totalInteractions,
        },
        recentInteractions,
      });
    }
  );

  return router;
}
