import "server-only";

import { Prisma } from "@/app/_generated/prisma/client";
import { prisma } from "@/app/_lib/db";

export type Period = "7d" | "30d" | "90d" | "tudo";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "tudo", label: "Tudo" },
];

export function periodToDate(period: Period): Date | null {
  if (period === "tudo") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgoUTC(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export type Kpis = {
  total: number;
  last30d: number;
  last7d: number;
  today: number;
  uniqueSessions30d: number;
  totalSearches: number;
};

export async function getKpis(): Promise<Kpis> {
  const from30 = daysAgoUTC(30);
  const from7 = daysAgoUTC(7);
  const today = startOfTodayUTC();

  const [total, last30d, last7d, todayCount, uniqueRows, totalSearches] =
    await Promise.all([
      prisma.pageView.count({ where: { isBot: false } }),
      prisma.pageView.count({
        where: { isBot: false, createdAt: { gte: from30 } },
      }),
      prisma.pageView.count({
        where: { isBot: false, createdAt: { gte: from7 } },
      }),
      prisma.pageView.count({
        where: { isBot: false, createdAt: { gte: today } },
      }),
      prisma.$queryRaw<{ unique_sessions: bigint }[]>`
        SELECT COUNT(DISTINCT "sessionHash") AS unique_sessions
        FROM page_views
        WHERE "isBot" = false AND "createdAt" >= ${from30}
      `,
      prisma.searchEvent.count({
        where: { isBot: false, createdAt: { gte: from30 } },
      }),
    ]);

  return {
    total,
    last30d,
    last7d,
    today: todayCount,
    uniqueSessions30d: Number(uniqueRows[0]?.unique_sessions ?? 0),
    totalSearches,
  };
}

export type DailyPoint = { date: string; views: number };

export async function getDailyViews(period: Period): Promise<DailyPoint[]> {
  const from = periodToDate(period);
  const today = startOfTodayUTC();
  const days = period === "tudo" ? 90 : period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const rangeStart = from ?? daysAgoUTC(days);

  const rows = await prisma.$queryRaw<{ day: Date; views: bigint }[]>`
    SELECT DATE_TRUNC('day', "createdAt" AT TIME ZONE 'UTC') AS day,
           COUNT(*) AS views
    FROM page_views
    WHERE "isBot" = false AND "createdAt" >= ${rangeStart}
    GROUP BY day
    ORDER BY day ASC
  `;

  const byKey = new Map<string, number>();
  for (const row of rows) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    byKey.set(key, Number(row.views));
  }

  const result: DailyPoint[] = [];
  const cursor = new Date(rangeStart);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, views: byKey.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export type TopWasteRow = { slug: string; name: string; views: number };

export async function getTopWasteTypes(period: Period): Promise<TopWasteRow[]> {
  const from = periodToDate(period);
  const fromFilter = from
    ? Prisma.sql`AND pv."createdAt" >= ${from}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    { slug: string; name: string; views: bigint }[]
  >`
    SELECT wt.slug, wt.name, COUNT(*) AS views
    FROM page_views pv
    JOIN waste_types wt ON wt.id = pv."wasteTypeId"
    WHERE pv."isBot" = false AND pv."wasteTypeId" IS NOT NULL
      ${fromFilter}
    GROUP BY wt.id, wt.slug, wt.name
    ORDER BY views DESC
    LIMIT 10
  `;
  return rows.map((row) => ({ ...row, views: Number(row.views) }));
}

export type TopPointRow = { slug: string; name: string; views: number };

export async function getTopPoints(period: Period): Promise<TopPointRow[]> {
  const from = periodToDate(period);
  const fromFilter = from
    ? Prisma.sql`AND pv."createdAt" >= ${from}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    { slug: string; name: string; views: bigint }[]
  >`
    SELECT dp.slug, dp.name, COUNT(*) AS views
    FROM page_views pv
    JOIN disposal_points dp ON dp.id = pv."pointId"
    WHERE pv."isBot" = false AND pv."pointId" IS NOT NULL
      ${fromFilter}
    GROUP BY dp.id, dp.slug, dp.name
    ORDER BY views DESC
    LIMIT 10
  `;
  return rows.map((row) => ({ ...row, views: Number(row.views) }));
}

export type TopSearchRow = {
  term: string;
  searches: number;
  zeroResults: boolean;
};

export async function getTopSearches(period: Period): Promise<TopSearchRow[]> {
  const from = periodToDate(period);
  const fromFilter = from
    ? Prisma.sql`AND "createdAt" >= ${from}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    { term: string; searches: bigint; zero_results: bigint }[]
  >`
    SELECT term,
           COUNT(*) AS searches,
           SUM(CASE WHEN "resultsCount" = 0 THEN 1 ELSE 0 END) AS zero_results
    FROM search_events
    WHERE "isBot" = false
      ${fromFilter}
    GROUP BY term
    ORDER BY searches DESC
    LIMIT 10
  `;
  return rows.map((row) => ({
    term: row.term,
    searches: Number(row.searches),
    zeroResults: Number(row.zero_results) === Number(row.searches),
  }));
}
