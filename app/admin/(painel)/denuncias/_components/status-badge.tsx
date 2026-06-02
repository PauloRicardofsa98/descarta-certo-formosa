import type { ReportStatus } from "@/app/_generated/prisma/client";
import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";

import { REPORT_STATUS_META } from "../_status";

export function StatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  const meta = REPORT_STATUS_META[status];
  return (
    <Badge className={cn("border-transparent", meta.badgeClass, className)}>
      {meta.label}
    </Badge>
  );
}
