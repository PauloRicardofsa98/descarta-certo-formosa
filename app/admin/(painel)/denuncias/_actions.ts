"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/_generated/prisma/client";
import { getSession } from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/db";

import { reportModerationSchema, type ReportModerationInput } from "./_schemas";

export type ActionResult = { ok: true } | { ok: false; message: string };

async function ensureAdmin(): Promise<{ ok: false; message: string } | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }
  return null;
}

function handlePrismaError(error: unknown): ActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return { ok: false, message: "Denúncia não encontrada." };
  }
  console.error(error);
  return { ok: false, message: "Erro ao salvar. Tente novamente." };
}

export async function updateReport(
  id: string,
  input: ReportModerationInput,
): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const validated = reportModerationSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const data = validated.data;
  const adminNotes = data.adminNotes.length > 0 ? data.adminNotes : null;

  try {
    await prisma.irregularDisposalReport.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes,
        resolvedAt: data.status === "RESOLVED" ? new Date() : null,
      },
    });
    revalidatePath("/admin/denuncias");
    revalidatePath(`/admin/denuncias/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function deleteReport(id: string): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    await prisma.irregularDisposalReport.delete({ where: { id } });
    revalidatePath("/admin/denuncias");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return handlePrismaError(error);
  }
}
