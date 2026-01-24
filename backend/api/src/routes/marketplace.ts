import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import type { Env } from "../env";
import { prisma } from "../db";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware";

const listQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : "")),
  industry: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : "")),
  location: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : "")),
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((n) => n === undefined || (Number.isFinite(n) && n >= 0), {
      message: "minPrice must be >= 0",
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((n) => n === undefined || (Number.isFinite(n) && n >= 0), {
      message: "maxPrice must be >= 0",
    }),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 50, {
      message: "limit must be between 1 and 50",
    }),
  cursor: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(800).optional().nullable(),
  industry: z.string().trim().min(1).max(60),
  location: z.string().trim().min(1).max(80),
  startingPrice: z
    .number()
    .int()
    .min(0)
    .max(1_000_000_000)
    .optional()
    .nullable(),
  website: z.string().trim().url().optional().nullable(),
});

function normalizeOptionalString(value: string | null | undefined) {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function marketplaceRouter(env: Env) {
  const router = Router();

  // List businesses with search + filters.
  router.get(
    "/businesses",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query" });
      }

      const { q, industry, location, minPrice, maxPrice, limit, cursor } =
        parsed.data;

      const where: Prisma.BusinessProfileWhereInput = {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          industry
            ? { industry: { equals: industry, mode: "insensitive" } }
            : {},
          location
            ? { location: { contains: location, mode: "insensitive" } }
            : {},
          minPrice !== undefined || maxPrice !== undefined
            ? {
                startingPrice: {
                  ...(minPrice !== undefined ? { gte: minPrice } : {}),
                  ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                },
              }
            : {},
        ],
      };

      const items = await prisma.businessProfile.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        take: limit + 1,
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
          location: true,
          startingPrice: true,
          website: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const page = items.slice(0, limit);
      const nextCursor =
        items.length > limit ? page[page.length - 1]?.id : null;

      return res.json({ items: page, nextCursor });
    },
  );

  // Business profile detail page.
  router.get(
    "/businesses/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const item = await prisma.businessProfile.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
          location: true,
          startingPrice: true,
          website: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, email: true, displayName: true } },
        },
      });

      if (!item) return res.status(404).json({ error: "Not found" });
      return res.json({ item });
    },
  );

  // Current user's business profile (single-profile UX).
  router.get("/me", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const item = await prisma.businessProfile.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        location: true,
        startingPrice: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ item });
  });

  router.post("/me", requireAuth(env), async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId;

    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const item = await prisma.businessProfile.create({
      data: {
        ownerId: userId,
        name: parsed.data.name,
        industry: parsed.data.industry,
        location: parsed.data.location,
        description: normalizeOptionalString(parsed.data.description),
        website: normalizeOptionalString(parsed.data.website),
        startingPrice: parsed.data.startingPrice ?? null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        location: true,
        startingPrice: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({ item });
  });

  router.patch(
    "/me/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const parsed = profileSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const existing = await prisma.businessProfile.findUnique({
        where: { id },
      });
      if (!existing || existing.ownerId !== userId) {
        return res.status(404).json({ error: "Not found" });
      }

      const item = await prisma.businessProfile.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.industry !== undefined
            ? { industry: parsed.data.industry }
            : {}),
          ...(parsed.data.location !== undefined
            ? { location: parsed.data.location }
            : {}),
          ...(parsed.data.description !== undefined
            ? { description: normalizeOptionalString(parsed.data.description) }
            : {}),
          ...(parsed.data.website !== undefined
            ? { website: normalizeOptionalString(parsed.data.website) }
            : {}),
          ...(parsed.data.startingPrice !== undefined
            ? { startingPrice: parsed.data.startingPrice ?? null }
            : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
          location: true,
          startingPrice: true,
          website: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json({ item });
    },
  );

  router.delete(
    "/me/:id",
    requireAuth(env),
    async (req: Request, res: Response) => {
      const userId = (req as AuthenticatedRequest).userId;
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const existing = await prisma.businessProfile.findUnique({
        where: { id },
      });
      if (!existing || existing.ownerId !== userId) {
        return res.status(404).json({ error: "Not found" });
      }

      await prisma.businessProfile.delete({ where: { id } });
      return res.status(204).send();
    },
  );

  return router;
}
