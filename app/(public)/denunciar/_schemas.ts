import { z } from "zod";

export const reportSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Descreva o que está acontecendo com pelo menos 10 caracteres.")
    .max(1000, "Limite de 1000 caracteres."),
  photos: z
    .array(z.string().url("URL inválida."))
    .min(1, "Envie pelo menos 1 foto do local.")
    .max(3, "Limite de 3 fotos."),
  latitude: z
    .number({
      required_error: "Marque o local da denúncia no mapa.",
      invalid_type_error: "Marque o local da denúncia no mapa.",
    })
    .min(-90)
    .max(90),
  longitude: z
    .number({
      required_error: "Marque o local da denúncia no mapa.",
      invalid_type_error: "Marque o local da denúncia no mapa.",
    })
    .min(-180)
    .max(180),
  referencePoint: z
    .string()
    .trim()
    .max(200, "Limite de 200 caracteres.")
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
