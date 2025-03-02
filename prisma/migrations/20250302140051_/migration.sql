/*
  Warnings:

  - You are about to alter the column `totalSpend` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `totalSpendAfterTax` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `totalAmount` on the `OrderProduct` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `salesAgentFullText` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesAgentId` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "totalSpend" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalSpendAfterTax" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "salesAgentFullText" TEXT NOT NULL,
ADD COLUMN     "salesAgentId" INTEGER NOT NULL,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "orderDate" SET DATA TYPE TEXT;
