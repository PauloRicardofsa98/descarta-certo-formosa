"use server";

import { redirect } from "next/navigation";

import { clearSessionCookie } from "@/app/_lib/auth";

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
