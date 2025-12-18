import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import type { Env } from "../env";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

const overviewQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 30))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 90, {
      message: "days must be between 1 and 90",
    }),
});

function yyyyMmDdUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function analyticsRouter(env: Env) {
  const router = Router();

  router.get(
    "/overview",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;

      const parsed = overviewQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query" });
      }

      const days = parsed.data.days;
      const now = new Date();
      const start = new Date(now);
      start.setUTCDate(start.getUTCDate() - (days - 1));
      start.setUTCHours(0, 0, 0, 0);

      const rows = await prisma.$queryRaw<
        Array<{ day: Date; type: "SCAN" | "CONTACT"; count: number }>
      >`
      SELECT
        date_trunc('day', i."occurredAt") AS day,
        i."type"::text AS type,
        COUNT(*)::int AS count
      FROM "Interaction" i
      JOIN "QRCard" q ON q."id" = i."qrCardId"
      WHERE q."userId" = ${userId}
        AND i."occurredAt" >= ${start}
      GROUP BY day, type
      ORDER BY day ASC;
    `;

      const byKey = new Map<string, { scan: number; contact: number }>();
      for (const r of rows) {
        const key = yyyyMmDdUTC(new Date(r.day));
        const prev = byKey.get(key) ?? { scan: 0, contact: 0 };
        if (r.type === "SCAN") prev.scan += r.count;
        if (r.type === "CONTACT") prev.contact += r.count;
        byKey.set(key, prev);
      }

      const series: Array<{ day: string; scans: number; contacts: number }> =
        [];
      const cursor = new Date(start);
      while (cursor <= now) {
        const key = yyyyMmDdUTC(cursor);
        const entry = byKey.get(key) ?? { scan: 0, contact: 0 };
        series.push({ day: key, scans: entry.scan, contacts: entry.contact });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      const totals = series.reduce(
        (acc, d) => ({
          scans: acc.scans + d.scans,
          contacts: acc.contacts + d.contacts,
        }),
        { scans: 0, contacts: 0 }
      );

      return res.json({ days, start: start.toISOString(), series, totals });
    }
  );

  router.get("/top", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const rows = await prisma.$queryRaw<
      Array<{
        qrCardId: string;
        label: string;
        publicId: string;
        scans: number;
      }>
    >`
      SELECT
        q."id" AS "qrCardId",
        q."label" AS label,
        q."publicId" AS "publicId",
        COUNT(*)::int AS scans
      FROM "Interaction" i
      JOIN "QRCard" q ON q."id" = i."qrCardId"
      WHERE q."userId" = ${userId}
        AND i."type" = 'SCAN'
      GROUP BY q."id", q."label", q."publicId"
      ORDER BY scans DESC
      LIMIT 5;
    `;

    return res.json({ items: rows });
  });

  return router;
}
