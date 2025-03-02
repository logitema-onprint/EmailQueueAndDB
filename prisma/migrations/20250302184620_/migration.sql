/*
  Warnings:

  - Added the required column `ruleType` to the `Rule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagType` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rule" ADD COLUMN "ruleType" TEXT NOT NULL DEFAULT 'global';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "tagType" TEXT NOT NULL DEFAULT 'default';
