"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { toErpRole } from "@/lib/rbac";

export async function requestAccountAccess() {
  const authUser = await getAuthenticatedUser();
  if (!authUser?.email) {
    redirect("/auth/sign-in");
  }
  if (!authUser.sessionId) {
    redirect("/account?erpAccess=session-required");
  }

  const email = authUser.email.trim();
  const escapedEmail = email.replace(/[\\%_]/g, "\\$&");
  const matches = await db.orm.public.User
    .where((user) => user.email.ilike(escapedEmail))
    .select("id", "role", "status")
    .limit(2)
    .all();

  if (matches.length !== 1) {
    redirect(`/account?erpAccess=${matches.length === 0 ? "not-provisioned" : "ambiguous"}`);
  }

  const user = matches[0];
  if (String(user.status) !== "ACTIVE") {
    redirect("/account?erpAccess=inactive");
  }

  const role = toErpRole(String(user.role));
  if (!role) {
    redirect("/account?erpAccess=role-required");
  }
  if (role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const existingRequest = await db.orm.public.SecurityAccessRequest
    .where({ sessionId: authUser.sessionId })
    .select("userId", "status")
    .first();
  if (existingRequest) {
    if (existingRequest.userId !== user.id) {
      throw new Error("The authenticated session is linked to a different EXLS account.");
    }
    redirect(
      `/account?erpAccess=${existingRequest.status === "APPROVED" ? "approval-approved" : existingRequest.status === "REJECTED" ? "approval-rejected" : "approval-pending"}`,
    );
  }

  await db.orm.public.SecurityAccessRequest.create({
    userId: user.id,
    sessionId: authUser.sessionId,
    status: "PENDING",
  });

  redirect("/account?erpAccess=approval-pending");
}
