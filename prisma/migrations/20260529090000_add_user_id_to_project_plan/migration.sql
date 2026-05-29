-- AlterTable
ALTER TABLE "ProjectPlan" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "ProjectPlan_userId_createdAt_idx" ON "ProjectPlan"("userId", "createdAt");
