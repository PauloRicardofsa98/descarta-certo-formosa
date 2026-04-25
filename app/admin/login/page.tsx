import type { Metadata } from "next";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso ao painel administrativo.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Painel administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesso restrito ao administrador da plataforma.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
