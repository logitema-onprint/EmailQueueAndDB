-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "jsonUrl" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_templateName_key" ON "Template"("templateName");

-- CreateIndex
CREATE INDEX "Template_templateName_idx" ON "Template"("templateName");
