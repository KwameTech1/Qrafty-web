-- Add Clerk user id mapping
ALTER TABLE "User" ADD COLUMN "clerkUserId" TEXT;

-- Unique index for Clerk user id
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
