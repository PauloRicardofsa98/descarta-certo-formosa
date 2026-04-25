-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "preparationInstructions" TEXT,
    "synonyms" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposal_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hours" JSONB NOT NULL,
    "phone" TEXT,
    "description" TEXT,
    "website" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disposal_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposal_point_waste_types" (
    "disposalPointId" TEXT NOT NULL,
    "wasteTypeId" TEXT NOT NULL,

    CONSTRAINT "disposal_point_waste_types_pkey" PRIMARY KEY ("disposalPointId","wasteTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "waste_types_name_key" ON "waste_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "waste_types_slug_key" ON "waste_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "disposal_points_slug_key" ON "disposal_points"("slug");

-- CreateIndex
CREATE INDEX "disposal_points_status_idx" ON "disposal_points"("status");

-- CreateIndex
CREATE INDEX "disposal_point_waste_types_wasteTypeId_idx" ON "disposal_point_waste_types"("wasteTypeId");

-- AddForeignKey
ALTER TABLE "disposal_point_waste_types" ADD CONSTRAINT "disposal_point_waste_types_disposalPointId_fkey" FOREIGN KEY ("disposalPointId") REFERENCES "disposal_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposal_point_waste_types" ADD CONSTRAINT "disposal_point_waste_types_wasteTypeId_fkey" FOREIGN KEY ("wasteTypeId") REFERENCES "waste_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
