"use server";

import { revalidatePath } from "next/cache";

import { Prisma, type Status } from "@/app/_generated/prisma/client";
import { getSession } from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/db";
import { generateSlug } from "@/app/_lib/slug";

import { disposalPointSchema, type DisposalPointInput } from "./_schemas";

export type ActionResult = { ok: true; id?: string } | { ok: false; message: string };

async function ensureAdmin(): Promise<{ ok: false; message: string } | null> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }
  return null;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function handlePrismaError(error: unknown): ActionResult {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        ok: false,
        message: "Já existe um ponto com nome ou identificador similar.",
      };
    }
    if (error.code === "P2025") {
      return { ok: false, message: "Ponto não encontrado." };
    }
  }
  console.error(error);
  return { ok: false, message: "Erro ao salvar. Tente novamente." };
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = generateSlug(name);
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.disposalPoint.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix++;
  }
}

export async function createDisposalPoint(
  input: DisposalPointInput,
): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const validated = disposalPointSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const data = validated.data;
  const slug = await generateUniqueSlug(data.name);

  try {
    const point = await prisma.disposalPoint.create({
      data: {
        name: data.name,
        slug,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        photos: data.photos,
        hours: data.hours,
        phone: emptyToNull(data.phone),
        description: emptyToNull(data.description),
        website: emptyToNull(data.website),
        status: data.status,
        wasteTypes: {
          create: data.wasteTypeIds.map((wasteTypeId) => ({ wasteTypeId })),
        },
      },
    });
    revalidatePath("/admin/pontos");
    revalidatePath("/admin");
    return { ok: true, id: point.id };
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function updateDisposalPoint(
  id: string,
  input: DisposalPointInput,
): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const validated = disposalPointSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos." };
  }

  const data = validated.data;
  const slug = await generateUniqueSlug(data.name, id);

  try {
    await prisma.$transaction([
      prisma.disposalPointWasteType.deleteMany({
        where: { disposalPointId: id },
      }),
      prisma.disposalPoint.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          photos: data.photos,
          hours: data.hours,
          phone: emptyToNull(data.phone),
          description: emptyToNull(data.description),
          website: emptyToNull(data.website),
          status: data.status,
          wasteTypes: {
            create: data.wasteTypeIds.map((wasteTypeId) => ({ wasteTypeId })),
          },
        },
      }),
    ]);
    revalidatePath("/admin/pontos");
    revalidatePath("/admin");
    revalidatePath(`/pontos/${slug}`);
    return { ok: true, id };
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function deleteDisposalPoint(id: string): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    await prisma.disposalPoint.delete({ where: { id } });
    revalidatePath("/admin/pontos");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function toggleDisposalPointStatus(
  id: string,
  newStatus: Status,
): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    await prisma.disposalPoint.update({
      where: { id },
      data: { status: newStatus },
    });
    revalidatePath("/admin/pontos");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return handlePrismaError(error);
  }
}
