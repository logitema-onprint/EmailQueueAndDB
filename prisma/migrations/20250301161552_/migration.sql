/*
  Warnings:

  - You are about to drop the column `productId` on the `Rule` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Rule_productId_idx";

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "productId";
