"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/app/_components/ui/switch";

import { toggleDisposalPointStatus } from "../_actions";

type Props = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export function StatusToggle({ id, name, status }: Props) {
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const newStatus = checked ? "ACTIVE" : "INACTIVE";
      const result = await toggleDisposalPointStatus(id, newStatus);
      if (result.ok) {
        toast.success(
          checked ? `"${name}" ativado.` : `"${name}" desativado.`,
        );
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Switch
      checked={status === "ACTIVE"}
      onCheckedChange={handleToggle}
      disabled={pending}
      aria-label={`Alternar status de ${name}`}
    />
  );
}
