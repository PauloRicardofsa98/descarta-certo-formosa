"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";

import { createWasteType, updateWasteType } from "../_actions";
import { wasteTypeSchema, type WasteTypeInput } from "../_schemas";

type Mode = { kind: "create" } | { kind: "edit"; id: string; originalName: string };

type Props = {
  mode: Mode;
  initialValues?: Partial<WasteTypeInput>;
};

export function WasteTypeForm({ mode, initialValues }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WasteTypeInput>({
    resolver: zodResolver(wasteTypeSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      preparationInstructions: initialValues?.preparationInstructions ?? "",
      synonyms: initialValues?.synonyms ?? "",
      icon: initialValues?.icon ?? "",
      order: initialValues?.order ?? 0,
    },
  });

  const currentName = watch("name");
  const nameChanged =
    mode.kind === "edit" && currentName.trim() !== mode.originalName;

  function onSubmit(data: WasteTypeInput) {
    setError(null);
    startTransition(async () => {
      const result =
        mode.kind === "create"
          ? await createWasteType(data)
          : await updateWasteType(mode.id, data);

      if (result.ok) {
        toast.success(
          mode.kind === "create"
            ? "Tipo criado com sucesso."
            : "Tipo atualizado com sucesso.",
        );
        router.push("/admin/tipos");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          autoComplete="off"
          autoFocus={mode.kind === "create"}
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
        {nameChanged && (
          <p className="text-xs text-muted-foreground">
            Alterar o nome também muda o endereço (slug) deste tipo. URLs antigas
            podem deixar de funcionar.
          </p>
        )}
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={3}
          aria-invalid={errors.description ? true : undefined}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preparationInstructions">Instruções de preparo</Label>
        <Textarea
          id="preparationInstructions"
          rows={4}
          placeholder="Ex.: Embale em saco plástico antes de levar."
          aria-invalid={errors.preparationInstructions ? true : undefined}
          {...register("preparationInstructions")}
        />
        {errors.preparationInstructions && (
          <p className="text-sm text-destructive" role="alert">
            {errors.preparationInstructions.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="synonyms">Palavras-chave / sinônimos</Label>
        <Input
          id="synonyms"
          placeholder="Ex.: AA, AAA, botão, recarregável"
          aria-invalid={errors.synonyms ? true : undefined}
          {...register("synonyms")}
        />
        <p className="text-xs text-muted-foreground">
          Separe por vírgulas. Ajuda a busca textual a encontrar este tipo por
          termos populares.
        </p>
        {errors.synonyms && (
          <p className="text-sm text-destructive" role="alert">
            {errors.synonyms.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="icon">Ícone</Label>
          <Input
            id="icon"
            placeholder="Ex.: nome do ícone Lucide"
            aria-invalid={errors.icon ? true : undefined}
            {...register("icon")}
          />
          {errors.icon && (
            <p className="text-sm text-destructive" role="alert">
              {errors.icon.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Ordem de exibição</Label>
          <Input
            id="order"
            type="number"
            inputMode="numeric"
            min={0}
            aria-invalid={errors.order ? true : undefined}
            {...register("order", { valueAsNumber: true })}
          />
          {errors.order && (
            <p className="text-sm text-destructive" role="alert">
              {errors.order.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/tipos")}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="sm:min-w-40"
        >
          {pending
            ? "Salvando..."
            : mode.kind === "create"
              ? "Criar tipo"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
