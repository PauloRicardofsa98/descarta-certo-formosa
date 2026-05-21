"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/app/_lib/utils";

const ITEMS = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/tipos", label: "Tipos" },
  { href: "/admin/pontos", label: "Pontos" },
  { href: "/admin/metricas", label: "Métricas" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação do painel" className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 py-1.5 text-sm sm:px-4">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded px-3 py-1.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
