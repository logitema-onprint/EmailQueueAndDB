-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userSurname" TEXT,
    "companyName" TEXT,
    "paymentDetails" TEXT NOT NULL,
    "subTotal" DOUBLE PRECISION NOT NULL,
    "salesAgentId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "ruleName" TEXT NOT NULL,
    "tags" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tagName" TEXT NOT NULL,
    "scheduledFor" INTEGER NOT NULL,
    "jobsCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER,
    "tagId" INTEGER NOT NULL,
    "tagName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledFor" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_salesAgentId_idx" ON "Order"("salesAgentId");

-- CreateIndex
CREATE INDEX "Order_country_idx" ON "Order"("country");

-- CreateIndex
CREATE INDEX "Order_subTotal_idx" ON "Order"("subTotal");

-- CreateIndex
CREATE INDEX "Rule_productId_idx" ON "Rule"("productId");

-- CreateIndex
CREATE INDEX "Tag_tagName_idx" ON "Tag"("tagName");

-- CreateIndex
CREATE INDEX "Job_orderId_idx" ON "Job"("orderId");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_tagId_status_createdAt_idx" ON "Job"("tagId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_orderId_status_createdAt_idx" ON "Job"("orderId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_orderId_tagId_status_idx" ON "Job"("orderId", "tagId", "status");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
