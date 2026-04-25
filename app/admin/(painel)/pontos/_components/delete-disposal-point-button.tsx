"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";

import { deleteDisposalPoint } from "../_actions";

type Props = {
  id: string;
  name: string;
};

export function DeleteDisposalPointButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDisposalPoint(id);
      if (result.ok) {
        toast.success(`Ponto "${name}" excluído.`);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Excluir ${name}`}
          >
            Excluir
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir &ldquo;{name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. As fotos enviadas continuarão no
            armazenamento, mas o ponto deixará de aparecer em qualquer lugar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
