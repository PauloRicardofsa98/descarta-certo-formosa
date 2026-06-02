import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            Descarta Certo Formosa
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-2 text-sm sm:gap-4">
            <Link
              href="/mapa"
              className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground"
            >
              Mapa
            </Link>
            <Link
              href="/denunciar"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Denunciar
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <p className="font-medium text-foreground">Descarta Certo Formosa</p>
          <p>
            Atividade Extensionista — UNINTER · 2026 · Plataforma comunitária
            para o descarte correto de resíduos em Formosa-GO.
          </p>
        </div>
      </footer>
    </div>
  );
}
