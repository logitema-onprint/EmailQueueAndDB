/*
  Warnings:

  - Changed the type of `productId` on the `Rule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Rule_productId_idx" ON "Rule"("productId");
