import { z } from "zod";

import { dayKeys, dayLabels, type DayKey, type Hours } from "@/app/_lib/hours";

const timeRegex = /^\d{2}:\d{2}$/;

const intervalSchema = z.object({
  from: z.string().regex(timeRegex, "Use o formato HH:mm."),
  to: z.string().regex(timeRegex, "Use o formato HH:mm."),
});

export const dayHoursSchema = z
  .object({
    open: z.boolean(),
    intervals: z.array(intervalSchema),
  })
  .superRefine((day, ctx) => {
    if (!day.open) return;
    if (day.intervals.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["intervals"],
        message: "Adicione ao menos um intervalo ou marque como fechado.",
      });
      return;
    }
    day.intervals.forEach((interval, index) => {
      if (interval.to <= interval.from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intervals", index, "to"],
          message: "O fechamento deve ser depois da abertura.",
        });
      }
    });
  });

export { dayKeys, dayLabels, type DayKey };

export const hoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

export type { Hours };

export const businessDay = {
  open: true,
  intervals: [{ from: "08:00", to: "17:00" }],
};
export const closedDay = { open: false, intervals: [] };

export const defaultHours: Hours = {
  monday: businessDay,
  tuesday: businessDay,
  wednesday: businessDay,
  thursday: businessDay,
  friday: businessDay,
  saturday: closedDay,
  sunday: closedDay,
};

export const disposalPointSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  address: z.string().trim().min(5, "Informe um endereço com pelo menos 5 caracteres."),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  photos: z
    .array(z.string().url("URL inválida."))
    .max(3, "Limite de 3 fotos."),
  hours: hoursSchema,
  phone: z.string().trim().max(30, "Limite de 30 caracteres."),
  description: z.string().trim().max(1000, "Limite de 1000 caracteres."),
  website: z
    .string()
    .trim()
    .max(200, "Limite de 200 caracteres.")
    .refine(
      (value) => value === "" || /^https?:\/\/.+/.test(value),
      "Use uma URL completa (https://...).",
    ),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  wasteTypeIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos 1 tipo aceito."),
});

export type DisposalPointInput = z.infer<typeof disposalPointSchema>;
