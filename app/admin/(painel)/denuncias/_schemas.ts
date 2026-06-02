import { z } from "zod";

export const reportModerationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "RESOLVED", "REJECTED"]),
  adminNotes: z.string().trim().max(2000, "Limite de 2000 caracteres."),
});

export type ReportModerationInput = z.infer<typeof reportModerationSchema>;
