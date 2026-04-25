"use client";

import { Plus, X } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Switch } from "@/app/_components/ui/switch";

import {
  dayKeys,
  dayLabels,
  type DayKey,
  type DisposalPointInput,
} from "../_schemas";

type Props = {
  control: Control<DisposalPointInput>;
  errors?: FieldErrors<DisposalPointInput>["hours"];
};

export function HoursInput({ control, errors }: Props) {
  return (
    <div className="space-y-3">
      {dayKeys.map((dayKey) => (
        <DayRow
          key={dayKey}
          dayKey={dayKey}
          control={control}
          dayErrors={errors?.[dayKey]}
        />
      ))}
    </div>
  );
}

type DayRowProps = {
  dayKey: DayKey;
  control: Control<DisposalPointInput>;
  dayErrors?: NonNullable<FieldErrors<DisposalPointInput>["hours"]>[DayKey];
};

function DayRow({ dayKey, control, dayErrors }: DayRowProps) {
  const isOpen = useWatch({ control, name: `hours.${dayKey}.open` });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `hours.${dayKey}.intervals`,
  });

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium text-foreground">{dayLabels[dayKey]}</span>
        <Controller
          control={control}
          name={`hours.${dayKey}.open`}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  field.value ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {field.value ? "Aberto" : "Fechado"}
              </span>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked && fields.length === 0) {
                    append({ from: "08:00", to: "17:00" });
                  }
                }}
                aria-label={`Aberto na ${dayLabels[dayKey]}`}
              />
            </div>
          )}
        />
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {fields.map((field, index) => {
            const intervalError = dayErrors?.intervals?.[index];
            return (
              <div key={field.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`hours.${dayKey}.intervals.${index}.from`}
                    render={({ field }) => (
                      <Input
                        type="time"
                        aria-label="Abre às"
                        className="max-w-32"
                        {...field}
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Controller
                    control={control}
                    name={`hours.${dayKey}.intervals.${index}.to`}
                    render={({ field }) => (
                      <Input
                        type="time"
                        aria-label="Fecha às"
                        className="max-w-32"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    aria-label="Remover intervalo"
                    className="ml-auto"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {intervalError?.from?.message && (
                  <p className="text-xs text-destructive">
                    {intervalError.from.message}
                  </p>
                )}
                {intervalError?.to?.message && (
                  <p className="text-xs text-destructive">
                    {intervalError.to.message}
                  </p>
                )}
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ from: "08:00", to: "17:00" })}
          >
            <Plus className="size-4" />
            Adicionar intervalo
          </Button>
          {dayErrors?.intervals && "message" in dayErrors.intervals && (
            <p className="text-xs text-destructive">
              {dayErrors.intervals.message as string}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
