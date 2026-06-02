"use server";

import { revalidatePath } from "next/cache";

import { getRequestFingerprint } from "@/app/_lib/analytics";
import { prisma } from "@/app/_lib/db";
import { Prisma } from "@/app/_generated/prisma/client";

import { reportSchema, type ReportInput } from "./_schemas";

export type CreateReportResult =
  | { ok: true; protocol: string }
  | { ok: false; message: string };

const PROTOCOL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += PROTOCOL_ALPHABET[Math.floor(Math.random() * PROTOCOL_ALPHABET.length)];
  }
  return code;
}

function generateProtocol(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `DCF-${stamp}-${randomCode(4)}`;
}

export async function createReport(
  input: ReportInput,
): Promise<CreateReportResult> {
  const validated = reportSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: "Dados inválidos. Revise os campos." };
  }

  const data = validated.data;
  const { ipHash, sessionHash } = await getRequestFingerprint();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentFromIp = await prisma.irregularDisposalReport.count({
    where: { ipHash, createdAt: { gte: oneHourAgo } },
  });
  if (recentFromIp >= 5) {
    return {
      ok: false,
      message:
        "Você enviou muitas denúncias na última hora. Aguarde um pouco e tente novamente.",
    };
  }

  const referencePoint = data.referencePoint?.trim()
    ? data.referencePoint.trim()
    : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const protocol = generateProtocol();
    try {
      await prisma.irregularDisposalReport.create({
        data: {
          protocol,
          description: data.description,
          photos: data.photos,
          latitude: data.latitude,
          longitude: data.longitude,
          referencePoint,
          sessionHash,
          ipHash,
        },
      });
      revalidatePath("/admin/denuncias");
      revalidatePath("/admin");
      return { ok: true, protocol };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      console.error(error);
      return {
        ok: false,
        message: "Não foi possível registrar a denúncia. Tente novamente.",
      };
    }
  }

  return {
    ok: false,
    message: "Não foi possível gerar um protocolo. Tente novamente.",
  };
}
