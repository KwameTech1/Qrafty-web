import type { Request, Response } from "express";
import { Router } from "express";

import { prisma } from "../db";

export function publicRouter() {
  const router = Router();

  // Public QR profile endpoint. Used by the QR itself and by the web public page.
  router.get("/qr/:publicId", async (req: Request, res: Response) => {
    const publicId = Array.isArray(req.params.publicId)
      ? req.params.publicId[0]
      : req.params.publicId;

    const qrCard = await prisma.qRCard.findUnique({
      where: { publicId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            bio: true,
            phone: true,
            website: true,
            company: true,
            title: true,
            location: true,
          },
        },
      },
    });

    if (!qrCard || !qrCard.isActive) {
      return res.status(404).json({ error: "Not found" });
    }

    await prisma.interaction.create({
      data: {
        qrCardId: qrCard.id,
        type: "SCAN",
        userAgent: req.get("user-agent") ?? null,
        referrer: req.get("referer") ?? null,
      },
    });

    return res.json({
      qrCard: { id: qrCard.id, label: qrCard.label, publicId: qrCard.publicId },
      profile: {
        displayName: qrCard.user.displayName,
        email: qrCard.user.email,
        bio: qrCard.user.bio,
        phone: qrCard.user.phone,
        website: qrCard.user.website,
        company: qrCard.user.company,
        title: qrCard.user.title,
        location: qrCard.user.location,
      },
    });
  });

  // Log a CONTACT interaction when a visitor taps the Contact CTA.
  router.post("/qr/:publicId/contact", async (req: Request, res: Response) => {
    const publicId = Array.isArray(req.params.publicId)
      ? req.params.publicId[0]
      : req.params.publicId;

    const qrCard = await prisma.qRCard.findUnique({
      where: { publicId },
      select: { id: true, isActive: true },
    });

    if (!qrCard || !qrCard.isActive) {
      return res.status(404).json({ error: "Not found" });
    }

    await prisma.interaction.create({
      data: {
        qrCardId: qrCard.id,
        type: "CONTACT",
        userAgent: req.get("user-agent") ?? null,
        referrer: req.get("referer") ?? null,
      },
    });

    return res.status(204).send();
  });

  return router;
}
