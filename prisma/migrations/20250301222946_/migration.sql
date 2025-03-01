/*
  Warnings:

  - You are about to alter the column `totalRevenue` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "totalRevenue" SET DATA TYPE DECIMAL(10,2);
