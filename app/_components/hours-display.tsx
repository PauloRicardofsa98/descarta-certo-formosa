import { Clock } from "lucide-react";

import { Badge } from "@/app/_components/ui/badge";
import {
  dayKeys,
  dayLabels,
  formatInterval,
  isOpenNow,
  type Hours,
} from "@/app/_lib/hours";

type Props = {
  hours: Hours;
};

export function HoursDisplay({ hours }: Props) {
  const open = isOpenNow(hours);

  return (
    <section
      aria-labelledby="hours-heading"
      className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="hours-heading"
          className="flex items-center gap-2 font-heading text-base font-semibold text-foreground"
        >
          <Clock aria-hidden className="size-5 text-muted-foreground" />
          Horário de funcionamento
        </h2>
        <Badge
          variant={open ? "default" : "secondary"}
          aria-live="polite"
          className={open ? "" : "bg-muted text-muted-foreground"}
        >
          {open ? "Aberto agora" : "Fechado agora"}
        </Badge>
      </div>

      <ul className="divide-y divide-border text-sm">
        {dayKeys.map((dayKey) => {
          const day = hours[dayKey];
          return (
            <li
              key={dayKey}
              className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <span className="font-medium text-foreground">
                {dayLabels[dayKey]}
              </span>
              <span className="text-right text-muted-foreground">
                {!day?.open || day.intervals.length === 0
                  ? "Fechado"
                  : day.intervals.map(formatInterval).join(" e ")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
