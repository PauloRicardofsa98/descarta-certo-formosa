-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "wasteTypeId" TEXT,
    "pointId" TEXT,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_events" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_wasteTypeId_idx" ON "page_views"("wasteTypeId");

-- CreateIndex
CREATE INDEX "page_views_pointId_idx" ON "page_views"("pointId");

-- CreateIndex
CREATE INDEX "page_views_isBot_createdAt_idx" ON "page_views"("isBot", "createdAt");

-- CreateIndex
CREATE INDEX "search_events_createdAt_idx" ON "search_events"("createdAt");

-- CreateIndex
CREATE INDEX "search_events_term_idx" ON "search_events"("term");

-- CreateIndex
CREATE INDEX "search_events_isBot_createdAt_idx" ON "search_events"("isBot", "createdAt");
