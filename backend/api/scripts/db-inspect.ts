import path from "path";
import dotenv from "dotenv";

import { prisma } from "../src/db";

// Load the same env file the API uses (backend/api/.env)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

async function main() {
  const [cmd] = process.argv.slice(2);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (check backend/api/.env)");
  }

  if (!cmd || cmd === "help") {
    console.log("Usage: npm run db:inspect -w api -- <command>\n");
    console.log("Commands:");
    console.log("  users        List latest users");
    console.log("  cards        List latest QR cards");
    console.log("  interactions List latest interactions");
    console.log("  businesses   List latest business profiles");
    console.log("  counts       Show row counts");
    return;
  }

  if (cmd === "counts") {
    const [users, cards, interactions, businesses] = await Promise.all([
      prisma.user.count(),
      prisma.qRCard.count(),
      prisma.interaction.count(),
      prisma.businessProfile.count(),
    ]);
    console.table({ users, cards, interactions, businesses });
    return;
  }

  if (cmd === "users") {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        displayName: true,
        googleId: true,
        createdAt: true,
      },
    });
    console.table(rows);
    return;
  }

  if (cmd === "cards") {
    const rows = await prisma.qRCard.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        publicId: true,
        title: true,
        createdAt: true,
        ownerId: true,
      },
    });
    console.table(rows);
    return;
  }

  if (cmd === "interactions") {
    const rows = await prisma.interaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        type: true,
        createdAt: true,
        qrCardId: true,
        userAgent: true,
        referrer: true,
      },
    });
    console.table(rows);
    return;
  }

  if (cmd === "businesses") {
    const rows = await prisma.businessProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        industry: true,
        location: true,
        startingPrice: true,
        website: true,
        ownerId: true,
        createdAt: true,
      },
    });
    console.table(rows);
    return;
  }

  throw new Error(`Unknown command: ${cmd}. Run with 'help'.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
