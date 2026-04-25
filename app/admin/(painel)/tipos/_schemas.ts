import { z } from "zod";

export const wasteTypeSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "Limite de 500 caracteres.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  preparationInstructions: z
    .string()
    .trim()
    .max(1000, "Limite de 1000 caracteres.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  synonyms: z
    .string()
    .trim()
    .max(500, "Limite de 500 caracteres.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  icon: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  order: z
    .number({ invalid_type_error: "Informe um número." })
    .int("Use um número inteiro.")
    .min(0, "Use um número não negativo."),
});

export type WasteTypeInput = z.infer<typeof wasteTypeSchema>;
