-- Modify the migration to use USING clause for type conversion
ALTER TABLE "Job" 
ALTER COLUMN "orderId" TYPE INTEGER USING (NULLIF("orderId", '')::INTEGER),
ALTER COLUMN "tagId" TYPE INTEGER USING (NULLIF("tagId", '')::INTEGER);

-- Keep the existing index creation statements
CREATE INDEX IF NOT EXISTS "Job_orderId_idx" ON "Job"("orderId");
CREATE INDEX IF NOT EXISTS "Job_tagId_status_createdAt_idx" ON "Job"("tagId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Job_orderId_status_createdAt_idx" ON "Job"("orderId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Job_orderId_tagId_status_idx" ON "Job"("orderId", "tagId", "status");