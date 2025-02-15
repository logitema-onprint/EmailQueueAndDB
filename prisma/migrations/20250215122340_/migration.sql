/*
  Warnings:

  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `message` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `templateName` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `ruleName` to the `Rule` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `scheduledFor` on the `Tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "ruleName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey",
DROP COLUMN "message",
DROP COLUMN "templateName",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "scheduledFor",
ADD COLUMN     "scheduledFor" INTEGER NOT NULL,
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tag_id_seq";

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");
