"use client";

import { useTransition } from "react";

import { Button } from "@/app/_components/ui/button";

import { logoutAction } from "../_actions/logout";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Saindo..." : "Sair"}
    </Button>
  );
}
