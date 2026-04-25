import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/app/_lib/auth";

import { LogoutButton } from "./_components/logout-button";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="font-heading text-base font-semibold tracking-tight text-foreground"
          >
            Painel administrativo
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span
              className="hidden text-muted-foreground sm:inline"
              aria-label="Administrador conectado"
            >
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}
