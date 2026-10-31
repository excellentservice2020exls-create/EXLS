"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { MANAGEMENT_ROLES, requireRole } from "@/lib/erp-auth";

export async function createEmployee(formData: FormData) {
  await requireRole(MANAGEMENT_ROLES);
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const matricule = String(formData.get("matricule") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (
    !firstName || !lastName || !matricule ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return;
  }

  await db.orm.public.User.create({
    firstName,
    lastName,
    phone: phone || null,
    matricule,
    email,
    passwordHash: "generated-from-form",
    role: "AGENT",
    status: "ACTIVE",
  });

  redirect("/employees");
}
