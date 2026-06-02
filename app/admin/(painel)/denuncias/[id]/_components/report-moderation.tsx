"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Textarea } from "@/app/_components/ui/textarea";
import type { ReportStatus } from "@/app/_generated/prisma/client";

import { deleteReport, updateReport } from "../../_actions";
import { REPORT_STATUS_META, REPORT_STATUS_ORDER } from "../../_status";

type Props = {
  id: string;
  protocol: string;
  initialStatus: ReportStatus;
  initialNotes: string;
};

export function ReportModeration({
  id,
  protocol,
  initialStatus,
  initialNotes,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [status, setStatus] = useState<ReportStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);

  function handleSave() {
    startTransition(async () => {
      const result = await updateReport(id, { status, adminNotes: notes });
      if (result.ok) {
        toast.success("Denúncia atualizada.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteReport(id);
      if (result.ok) {
        toast.success(`Denúncia ${protocol} excluída.`);
        router.push("/admin/denuncias");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ReportStatus)}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_STATUS_ORDER.map((statusKey) => (
              <SelectItem key={statusKey} value={statusKey}>
                {REPORT_STATUS_META[statusKey].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {REPORT_STATUS_META[status].description}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminNotes">Notas internas</Label>
        <Textarea
          id="adminNotes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ex.: Encaminhado à Secretaria de Meio Ambiente em 02/06 pelo protocolo nº 123."
        />
        <p className="text-xs text-muted-foreground">
          Visível apenas para a administração.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          size="lg"
          onClick={handleSave}
          disabled={pending}
          aria-busy={pending}
          className="sm:min-w-44"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Excluir denúncia ${protocol}`}
              >
                Excluir denúncia
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {protocol}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Prefira marcar como
                &ldquo;Rejeitada&rdquo; em vez de excluir, para manter o
                histórico.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                aria-busy={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
