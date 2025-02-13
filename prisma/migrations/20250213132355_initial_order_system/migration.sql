/*
  Warnings:

  - Added the required column `tagName` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_tagId_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "tagName" TEXT NOT NULL,
ALTER COLUMN "orderId" SET DATA TYPE TEXT,
ALTER COLUMN "tagId" SET DATA TYPE TEXT;
