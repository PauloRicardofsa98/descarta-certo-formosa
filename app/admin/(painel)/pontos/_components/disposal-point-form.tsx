"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Textarea } from "@/app/_components/ui/textarea";

import { createDisposalPoint, updateDisposalPoint } from "../_actions";
import {
  defaultHours,
  disposalPointSchema,
  type DisposalPointInput,
} from "../_schemas";

import {
  WasteTypesMultiSelect,
  type WasteTypeOption,
} from "@/app/_components/waste-types-multi-select";

import { HoursInput } from "./hours-input";
import { PhotosInput } from "./photos-input";

type Mode = { kind: "create" } | { kind: "edit"; id: string };

type Props = {
  mode: Mode;
  wasteTypeOptions: WasteTypeOption[];
  initialValues?: Partial<DisposalPointInput>;
};

const emptyDefaults: DisposalPointInput = {
  name: "",
  address: "",
  latitude: null,
  longitude: null,
  photos: [],
  hours: defaultHours,
  phone: "",
  description: "",
  website: "",
  status: "ACTIVE",
  wasteTypeIds: [],
};

export function DisposalPointForm({ mode, wasteTypeOptions, initialValues }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DisposalPointInput>({
    resolver: zodResolver(disposalPointSchema),
    defaultValues: { ...emptyDefaults, ...initialValues },
  });

  function onSubmit(data: DisposalPointInput) {
    setError(null);
    startTransition(async () => {
      const result =
        mode.kind === "create"
          ? await createDisposalPoint(data)
          : await updateDisposalPoint(mode.id, data);

      if (result.ok) {
        toast.success(
          mode.kind === "create"
            ? "Ponto criado com sucesso."
            : "Ponto atualizado com sucesso.",
        );
        router.push("/admin/pontos");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Section title="Identificação" description="Nome, descrição e contato do ponto.">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" autoComplete="off" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição / observações</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Ex.: Trazer o material já lavado. Aceita até 10 unidades por visita."
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="(61) 99999-0000"
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://exemplo.com.br"
              {...register("website")}
            />
            <FieldError message={errors.website?.message} />
          </div>
        </div>
      </Section>

      <Section title="Localização" description="Endereço e, opcionalmente, coordenadas para o mapa.">
        <div className="space-y-2">
          <Label htmlFor="address">Endereço *</Label>
          <Input
            id="address"
            placeholder="Rua, número, bairro"
            {...register("address")}
          />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="-15.5378"
              {...register("latitude", {
                setValueAs: (value) =>
                  value === "" || value === null ? null : Number(value),
              })}
            />
            <FieldError message={errors.latitude?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="-47.3372"
              {...register("longitude", {
                setValueAs: (value) =>
                  value === "" || value === null ? null : Number(value),
              })}
            />
            <FieldError message={errors.longitude?.message} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Sem coordenadas, o ponto aparece apenas em listagens, não no mapa.
        </p>
      </Section>

      <Section title="Horário de funcionamento" description="Defina os horários por dia da semana.">
        <HoursInput control={control} errors={errors.hours} />
      </Section>

      <Section title="Fotos" description="Até 3 imagens (PNG, JPG ou WebP).">
        <Controller
          control={control}
          name="photos"
          render={({ field }) => (
            <PhotosInput value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError message={errors.photos?.message} />
      </Section>

      <Section title="Tipos aceitos *" description="Selecione ao menos um tipo de resíduo aceito neste ponto.">
        <Controller
          control={control}
          name="wasteTypeIds"
          render={({ field }) => (
            <WasteTypesMultiSelect
              options={wasteTypeOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <FieldError message={errors.wasteTypeIds?.message} />
      </Section>

      <Section title="Status" description="Pontos inativos não aparecem no site público.">
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/pontos")}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="sm:min-w-44"
        >
          {pending
            ? "Salvando..."
            : mode.kind === "create"
              ? "Criar ponto"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="space-y-1">
        <span className="font-heading text-base font-semibold text-foreground">
          {title}
        </span>
        {description && (
          <p className="block text-sm text-muted-foreground">{description}</p>
        )}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
