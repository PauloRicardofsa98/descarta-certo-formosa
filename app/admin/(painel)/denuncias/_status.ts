import type { ReportStatus } from "@/app/_generated/prisma/client";

export type StatusMeta = {
  label: string;
  description: string;
  badgeClass: string;
  markerColor: string;
};

export const REPORT_STATUS_META: Record<ReportStatus, StatusMeta> = {
  PENDING: {
    label: "Pendente",
    description: "Recém-recebida, aguardando avaliação.",
    badgeClass: "bg-warning text-warning-foreground",
    markerColor: "#E0A82E",
  },
  APPROVED: {
    label: "Encaminhada",
    description: "Validada e encaminhada à Prefeitura.",
    badgeClass: "bg-chart-5 text-white",
    markerColor: "#2C7DA0",
  },
  RESOLVED: {
    label: "Resolvida",
    description: "Local limpo / problema solucionado.",
    badgeClass: "bg-success text-success-foreground",
    markerColor: "#2FA56A",
  },
  REJECTED: {
    label: "Rejeitada",
    description: "Denúncia inválida, duplicada ou trote.",
    badgeClass: "bg-muted text-muted-foreground border border-border",
    markerColor: "#9CA3AF",
  },
};

export const REPORT_STATUS_ORDER: ReportStatus[] = [
  "PENDING",
  "APPROVED",
  "RESOLVED",
  "REJECTED",
];
