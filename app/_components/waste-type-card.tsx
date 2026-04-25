import Link from "next/link";
import { Recycle } from "lucide-react";

import { cn } from "@/app/_lib/utils";

export type WasteTypeCardData = {
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
};

type Props = {
  wasteType: WasteTypeCardData;
  className?: string;
};

export function WasteTypeCard({ wasteType, className }: Props) {
  return (
    <Link
      href={`/tipos/${wasteType.slug}`}
      className={cn(
        "group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 outline-none transition-all hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15"
      >
        <Recycle className="size-5" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-heading font-semibold text-foreground">
          {wasteType.name}
        </span>
        {wasteType.description && (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {wasteType.description}
          </span>
        )}
      </span>
    </Link>
  );
}
