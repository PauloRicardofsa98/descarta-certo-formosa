-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'RESOLVED', 'REJECTED');
-- CreateTable
CREATE TABLE "irregular_disposal_reports" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "referencePoint" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "irregular_disposal_reports_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "irregular_disposal_reports_protocol_key" ON "irregular_disposal_reports"("protocol");
-- CreateIndex
CREATE INDEX "irregular_disposal_reports_status_idx" ON "irregular_disposal_reports"("status");
-- CreateIndex
CREATE INDEX "irregular_disposal_reports_createdAt_idx" ON "irregular_disposal_reports"("createdAt");
-- CreateIndex
CREATE INDEX "irregular_disposal_reports_status_createdAt_idx" ON "irregular_disposal_reports"("status", "createdAt");
