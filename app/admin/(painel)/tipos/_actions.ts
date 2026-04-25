"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/_generated/prisma/client";
import { getSession } from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/db";
import { generateSlug } from "@/app/_lib/slug";

import { wasteTypeSchema, type WasteTypeInput } from "./_schemas";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

async function ensureAdmin(): Promise<{ ok: false; message: string } | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }
  return null;
}

function handlePrismaError(error: unknown): ActionResult {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        ok: false,
        message: "Já existe um tipo com nome ou identificador similar.",
      };
    }
  }
  console.error(error);
  return { ok: false, message: "Erro ao salvar. Tente novamente." };
}

export async function createWasteType(input: WasteTypeInput): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const validated = wasteTypeSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const data = validated.data;
  const slug = generateSlug(data.name);

  try {
    await prisma.wasteType.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        preparationInstructions: data.preparationInstructions,
        synonyms: data.synonyms,
        icon: data.icon,
        order: data.order,
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }

  revalidatePath("/admin/tipos");
  return { ok: true };
}

export async function updateWasteType(
  id: string,
  input: WasteTypeInput,
): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const validated = wasteTypeSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const data = validated.data;
  const slug = generateSlug(data.name);

  try {
    await prisma.wasteType.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        preparationInstructions: data.preparationInstructions,
        synonyms: data.synonyms,
        icon: data.icon,
        order: data.order,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, message: "Tipo não encontrado." };
    }
    return handlePrismaError(error);
  }

  revalidatePath("/admin/tipos");
  revalidatePath(`/tipos/${slug}`);
  return { ok: true };
}

export async function deleteWasteType(id: string): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    await prisma.wasteType.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, message: "Tipo não encontrado." };
    }
    return handlePrismaError(error);
  }

  revalidatePath("/admin/tipos");
  return { ok: true };
}
