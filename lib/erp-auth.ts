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

  const email = authUser.email.trim();
  const escapedEmail = email.replace(/[\\%_]/g, "\\$&");
  const matches = await db.orm.public.User
    .where((user) => user.email.ilike(escapedEmail))
    .select("id", "email", "role", "status")
    .limit(2)
    .all();

  if (matches.length !== 1) {
    redirect(`/account?erpAccess=${matches.length === 0 ? "not-provisioned" : "ambiguous"}`);
  }

  const user = matches[0];
  if (String(user.status) !== "ACTIVE") {
    redirect("/account?erpAccess=inactive");
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