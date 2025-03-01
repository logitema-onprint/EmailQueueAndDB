/*
  Warnings:

  - Changed the type of `salesAgentId` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "salesAgentId",
ADD COLUMN     "salesAgentId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Order_salesAgentId_idx" ON "Order"("salesAgentId");
