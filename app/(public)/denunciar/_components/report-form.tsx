"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Crosshair, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";

import { createReport } from "../_actions";
import { reportSchema, type ReportInput } from "../_schemas";

import { LocationPickerMap } from "./location-picker-map";
import { ReportPhotosInput } from "./report-photos-input";

type GeoState = "idle" | "locating" | "located" | "denied" | "unsupported";

const emptyDefaults: ReportInput = {
  description: "",
  photos: [],
  latitude: undefined as unknown as number,
  longitude: undefined as unknown as number,
  referencePoint: "",
};

export function ReportForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    register("latitude");
    register("longitude");
  }, [register]);

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  function locate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude, {
          shouldValidate: true,
        });
        setValue("longitude", position.coords.longitude, {
          shouldValidate: true,
        });
        setGeoState("located");
      },
      () => {
        setGeoState("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useEffect(() => {
    locate();
    // captura a localização automaticamente ao abrir a página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(data: ReportInput) {
    setError(null);
    startTransition(async () => {
      const result = await createReport(data);
      if (result.ok) {
        setProtocol(result.protocol);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(result.message);
      }
    });
  }

  if (protocol) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <CheckCircle2
          className="mx-auto size-12 text-primary"
          aria-hidden="true"
        />
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground sm:text-2xl">
          Denúncia registrada!
        </h2>
        <p className="mx-auto mt-2 max-w-prose text-base text-muted-foreground">
          Obrigado por ajudar a cuidar de Formosa. Sua denúncia foi enviada à
          equipe responsável, que vai avaliar e encaminhar à Prefeitura.
        </p>
        <div className="mx-auto mt-6 max-w-xs rounded-md border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Número de protocolo
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-foreground">
            {protocol}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setProtocol(null);
              setError(null);
              setValue("description", "");
              setValue("photos", []);
              setValue("referencePoint", "");
            }}
          >
            Registrar outra denúncia
          </Button>
          <Button render={<Link href="/" />} nativeButton={false} size="lg">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Section
        title="1. Onde está o problema?"
        description="Capturamos sua localização automaticamente. Toque no mapa ou arraste o marcador vermelho para ajustar o ponto exato."
      >
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={locate}
            disabled={geoState === "locating"}
            className="self-start"
          >
            {geoState === "locating" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Crosshair className="size-4" aria-hidden="true" />
            )}
            Usar minha localização atual
          </Button>

          <GeoStatus state={geoState} hasPoint={latitude != null} />

          <LocationPickerMap
            latitude={latitude ?? null}
            longitude={longitude ?? null}
            onChange={(lat, lng) => {
              setValue("latitude", lat, { shouldValidate: true });
              setValue("longitude", lng, { shouldValidate: true });
            }}
          />
          <FieldError message={errors.latitude?.message} />
        </div>
      </Section>

      <Section
        title="2. Fotos do local"
        description="Envie de 1 a 3 fotos que mostrem o descarte irregular."
      >
        <Controller
          control={control}
          name="photos"
          render={({ field }) => (
            <ReportPhotosInput value={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError message={errors.photos?.message} />
      </Section>

      <Section
        title="3. O que você está vendo?"
        description="Descreva o tipo de resíduo e a situação. Quanto mais detalhes, melhor."
      >
        <div className="space-y-2">
          <Label htmlFor="description" className="sr-only">
            Descrição da denúncia
          </Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Ex.: Acúmulo de entulho e móveis velhos na esquina da rua, atraindo insetos."
            className="text-base"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referencePoint">Ponto de referência (opcional)</Label>
          <Textarea
            id="referencePoint"
            rows={2}
            placeholder="Ex.: Em frente à padaria São José, perto da praça."
            className="text-base"
            {...register("referencePoint")}
          />
          <FieldError message={errors.referencePoint?.message} />
        </div>
      </Section>

      <div className="border-t border-border pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="w-full text-base sm:w-auto sm:min-w-56"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="size-4" aria-hidden="true" />
          )}
          {pending ? "Enviando..." : "Enviar denúncia"}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          A denúncia é anônima. Não coletamos seu nome, e-mail ou telefone.
        </p>
      </div>
    </form>
  );
}

function GeoStatus({ state, hasPoint }: { state: GeoState; hasPoint: boolean }) {
  if (state === "locating") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Localizando você…
      </p>
    );
  }
  if (hasPoint) {
    return (
      <p className="flex items-center gap-2 text-sm text-primary">
        <MapPin className="size-4" aria-hidden="true" />
        Local marcado. Ajuste no mapa se necessário.
      </p>
    );
  }
  if (state === "denied") {
    return (
      <p className="text-sm text-muted-foreground">
        Não conseguimos acessar sua localização. Toque no mapa para marcar o
        local manualmente.
      </p>
    );
  }
  if (state === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        Seu navegador não suporta localização automática. Toque no mapa para
        marcar o local.
      </p>
    );
  }
  return null;
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
        <span className="font-heading text-lg font-semibold text-foreground">
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
