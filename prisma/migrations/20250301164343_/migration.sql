-- CreateTable
CREATE TABLE "SalesAgent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "fullText" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalesAgent_pkey" PRIMARY KEY ("id")
);
