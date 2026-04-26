import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";

export type DisposalPointCardData = {
  slug: string;
  name: string;
  address: string;
  wasteTypes: { name: string; slug: string }[];
};

type Props = {
  point: DisposalPointCardData;
  highlightedTypeSlug?: string;
  className?: string;
};

export function DisposalPointCard({
  point,
  highlightedTypeSlug,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          <Link
            href={`/pontos/${point.slug}`}
            className="rounded-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {point.name}
          </Link>
        </h3>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{point.address}</span>
        </p>
      </div>

      {point.wasteTypes.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {point.wasteTypes.map((type) => (
            <li key={type.slug}>
              <Badge
                variant={
                  highlightedTypeSlug === type.slug ? "default" : "secondary"
                }
                className="font-normal"
              >
                {type.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/pontos/${point.slug}`}
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary outline-none transition-colors hover:text-primary/80 focus-visible:underline"
      >
        Ver detalhes
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </article>
  );
}
