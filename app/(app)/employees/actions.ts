"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { canAssignRole, requirePermission } from "@/lib/erp-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const employeeRoles = ["AGENT", "SUPERVISOR", "MANAGER", "DIRECTOR"] as const;
type EmployeeRole = (typeof employeeRoles)[number];

function isEmployeeRole(value: string): value is EmployeeRole {
  return employeeRoles.some((role) => role === value);
}

function getInviteRedirectUrl(origin: string | null) {
  if (!origin) {
    throw new Error("The request origin is required to send an EXLS invitation.");
  }

  const parsedOrigin = new URL(origin);
  if (
    !["http:", "https:"].includes(parsedOrigin.protocol) ||
    parsedOrigin.origin !== origin
  ) {
    throw new Error("The request origin is not a valid application origin.");
  }

  const callbackUrl = new URL("/auth/callback", parsedOrigin);
  callbackUrl.searchParams.set("next", "/auth/reset-password");
  return callbackUrl.toString();
}

export async function createEmployee(formData: FormData) {
  const user = await requirePermission("employees:create");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const matricule = String(formData.get("matricule") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestedRole = String(formData.get("role") ?? "");

  if (
    !firstName || !lastName || !matricule ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isEmployeeRole(requestedRole)
  ) {
    redirect("/employees/new?error=invalid");
  }
  if (!canAssignRole(user, requestedRole)) {
    redirect("/employees/new?error=role-not-assignable");
  }

  const escapedEmail = email.replace(/[\\%_]/g, "\\$&");
  const existingProfiles = await db.orm.public.User
    .where((user) => user.email.ilike(escapedEmail))
    .limit(1)
    .all();

  if (existingProfiles.length > 0) {
    redirect("/employees/new?error=profile-exists");
  }

  const requestHeaders = await headers();
  const supabase = createAdminClient();
  const { data: invitation, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { firstName, lastName },
      redirectTo: getInviteRedirectUrl(requestHeaders.get("origin")),
    });

  const existingAuthUser =
    inviteError?.code === "email_exists" ||
    inviteError?.code === "user_already_exists";

  if (inviteError && !existingAuthUser) {
    redirect("/employees/new?error=invite");
  }

  const authUserId = existingAuthUser ? null : invitation.user?.id;
  if (!existingAuthUser && !authUserId) {
    throw new Error("Supabase did not return the invited user's ID.");
  }

  try {
    await db.orm.public.User.create({
      firstName,
      lastName,
      phone: phone || null,
      matricule,
      email,
      passwordHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
      role: requestedRole,
      status: "ACTIVE",
    });
  } catch (profileError) {
    if (authUserId) {
      const { error: deleteError } =
        await supabase.auth.admin.deleteUser(authUserId);
      if (deleteError) {
        throw new Error(
          "The EXLS profile could not be created and the newly invited authentication account could not be removed.",
          { cause: profileError },
        );
      }
    }

    redirect("/employees/new?error=profile");
  }

  redirect(`/employees?status=${existingAuthUser ? "linked" : "invited"}`);
}
