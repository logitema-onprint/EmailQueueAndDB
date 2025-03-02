/*
  Warnings:

  - You are about to drop the column `totalOrders` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `totalRevenue` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the `CountryRevenue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `city` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Country" DROP COLUMN "totalOrders",
DROP COLUMN "totalRevenue";

-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL;

-- DropTable
DROP TABLE "CountryRevenue";

-- CreateIndex
CREATE INDEX "OrderProduct_country_idx" ON "OrderProduct"("country");

-- CreateIndex
CREATE INDEX "OrderProduct_salesAgentId_idx" ON "OrderProduct"("salesAgentId");
