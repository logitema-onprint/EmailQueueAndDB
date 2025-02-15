-- DropIndex
DROP INDEX "Job_status_idx";

-- DropIndex
DROP INDEX "Job_tagId_idx";

-- CreateIndex
CREATE INDEX "Job_tagId_status_createdAt_idx" ON "Job"("tagId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_orderId_status_createdAt_idx" ON "Job"("orderId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_orderId_tagId_status_idx" ON "Job"("orderId", "tagId", "status");
