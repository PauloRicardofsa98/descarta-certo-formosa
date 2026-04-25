"use server";

import { redirect } from "next/navigation";

import {
  comparePassword,
  setSessionCookie,
  signSession,
} from "@/app/_lib/auth";
import { prisma } from "@/app/_lib/db";

import { loginSchema, type LoginInput } from "../_schemas";

export type LoginResult = { ok: true } | { ok: false; message: string };

const GENERIC_MESSAGE = "E-mail ou senha inválidos.";

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const validated = loginSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, message: GENERIC_MESSAGE };
  }

  const { email, password } = validated.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { ok: false, message: GENERIC_MESSAGE };
  }

  const passwordMatches = await comparePassword(password, admin.passwordHash);
  if (!passwordMatches) {
    return { ok: false, message: GENERIC_MESSAGE };
  }

  const token = await signSession({ adminId: admin.id, email: admin.email });
  await setSessionCookie(token);

  redirect("/admin");
}
