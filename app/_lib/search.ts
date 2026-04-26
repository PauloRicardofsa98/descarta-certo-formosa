import "server-only";

import { prisma } from "@/app/_lib/db";

export type WasteTypeSearchResult = {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type PointSearchResult = {
  slug: string;
  name: string;
  address: string;
  wasteTypes: { slug: string; name: string }[];
};

export type SearchResults = {
  query: string;
  wasteTypes: WasteTypeSearchResult[];
  points: PointSearchResult[];
};

const MAX_RESULTS = 50;

export async function searchAll(query: string): Promise<SearchResults> {
  const term = query.trim();
  if (!term) {
    return { query: term, wasteTypes: [], points: [] };
  }

  const [wasteTypes, pointsRaw] = await Promise.all([
    prisma.wasteType.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { synonyms: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: MAX_RESULTS,
      select: {
        slug: true,
        name: true,
        description: true,
        icon: true,
      },
    }),
    prisma.disposalPoint.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { address: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: MAX_RESULTS,
      select: {
        slug: true,
        name: true,
        address: true,
        wasteTypes: {
          select: { wasteType: { select: { slug: true, name: true } } },
          orderBy: { wasteType: { order: "asc" } },
        },
      },
    }),
  ]);

  const points: PointSearchResult[] = pointsRaw.map((point) => ({
    slug: point.slug,
    name: point.name,
    address: point.address,
    wasteTypes: point.wasteTypes.map((relation) => ({
      slug: relation.wasteType.slug,
      name: relation.wasteType.name,
    })),
  }));

  return { query: term, wasteTypes, points };
}
