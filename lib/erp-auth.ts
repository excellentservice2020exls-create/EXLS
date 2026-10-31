import "server-only";

import { notFound, redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const MANAGEMENT_ROLES = ["ADMIN", "MANAGER", "DIRECTOR"] as const;
export const SUPERVISOR_ROLES = [...MANAGEMENT_ROLES, "SUPERVISOR"] as const;
export const ERP_ROLES = [...SUPERVISOR_ROLES, "AGENT"] as const;

export async function requireAppUser() {
  const authUser = await getAuthenticatedUser();
  if (!authUser?.email) {
    redirect("/auth/sign-in");
  }

  const user = await db.orm.public.User
    .where({ email: authUser.email })
    .select("id", "email", "role", "status")
    .first();

  if (!user || String(user.status) !== "ACTIVE") {
    notFound();
  }

  return user;
}

export async function requireRole(allowedRoles: readonly string[]) {
  const user = await requireAppUser();
  if (!allowedRoles.includes(String(user.role))) {
    notFound();
  }

  return user;
}