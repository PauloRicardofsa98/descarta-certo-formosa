import "server-only";

import { createHash } from "crypto";
import { cookies, headers } from "next/headers";

import { prisma } from "@/app/_lib/db";

const ANON_COOKIE = "dc_anon";

export const BOT_UA_REGEX =
  /(bot|crawler|spider|crawling|headless|python-requests|curl\/|wget\/|http-client|monitoring|googlebot|bingbot|duckduckbot|slurp|yandex|baidu|facebookexternalhit|preview|lighthouse|pagespeed)/i;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function dailySalt(): string {
  const today = new Date().toISOString().slice(0, 10);
  const secret = process.env.JWT_SECRET ?? "dev-fallback-salt";
  return sha256(`${secret}:${today}`);
}

function firstIp(forwarded: string | null): string {
  if (!forwarded) return "unknown";
  const first = forwarded.split(",")[0]?.trim();
  return first || "unknown";
}

async function resolveContext() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);

  const userAgent = headersList.get("user-agent");
  const referrer = headersList.get("referer");
  const forwarded =
    headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip");

  const ip = firstIp(forwarded);
  const ipHash = sha256(`${ip}:${dailySalt()}`);

  // Cookie é setado pelo proxy.ts (middleware). Em caso raro de ausência
  // (ex.: primeiro request antes do middleware concluir), derivamos do IP+UA.
  const anonId =
    cookieStore.get(ANON_COOKIE)?.value ??
    sha256(`${ip}:${userAgent ?? "unknown"}`);
  const sessionHash = sha256(anonId);

  const isBot = userAgent ? BOT_UA_REGEX.test(userAgent) : true;

  return { userAgent, referrer, ipHash, sessionHash, isBot };
}

function shouldSkip(path: string): boolean {
  return path.startsWith("/admin") || path.startsWith("/api");
}

export async function trackView(input: {
  path: string;
  wasteTypeId?: string;
  pointId?: string;
}): Promise<void> {
  if (shouldSkip(input.path)) return;
  try {
    const ctx = await resolveContext();
    await prisma.pageView.create({
      data: {
        path: input.path,
        wasteTypeId: input.wasteTypeId ?? null,
        pointId: input.pointId ?? null,
        sessionHash: ctx.sessionHash,
        ipHash: ctx.ipHash,
        userAgent: ctx.userAgent,
        referrer: ctx.referrer,
        isBot: ctx.isBot,
      },
    });
  } catch {
    // analytics nunca pode derrubar a página
  }
}

export async function trackSearch(input: {
  term: string;
  resultsCount: number;
}): Promise<void> {
  const term = input.term.trim().toLowerCase();
  if (!term) return;
  try {
    const ctx = await resolveContext();
    await prisma.searchEvent.create({
      data: {
        term,
        resultsCount: input.resultsCount,
        sessionHash: ctx.sessionHash,
        ipHash: ctx.ipHash,
        isBot: ctx.isBot,
      },
    });
  } catch {
    // idem
  }
}
