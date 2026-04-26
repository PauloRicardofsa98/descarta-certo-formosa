export const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayKey = (typeof dayKeys)[number];

export const dayLabels: Record<DayKey, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export type Interval = { from: string; to: string };
export type DayHours = { open: boolean; intervals: Interval[] };
export type Hours = Record<DayKey, DayHours>;

const TIMEZONE = "America/Sao_Paulo";

const jsDayToKey: Record<number, DayKey> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

function getNowParts(): { dayKey: DayKey; time: string } {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  const reference = new Date();
  const localized = new Date(
    reference.toLocaleString("en-US", { timeZone: TIMEZONE }),
  );
  const dayKey = jsDayToKey[localized.getDay()];

  return { dayKey, time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}` };
}

export function isOpenNow(hours: Hours): boolean {
  const { dayKey, time } = getNowParts();
  const today = hours[dayKey];
  if (!today?.open) return false;
  return today.intervals.some(
    (interval) => interval.from <= time && time < interval.to,
  );
}

export function formatInterval(interval: Interval): string {
  return `${interval.from}–${interval.to}`;
}
