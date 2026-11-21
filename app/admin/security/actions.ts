"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requireRole } from "@/lib/erp-auth";
import { isUuidV7 } from "@/lib/utils";

function formField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function decideAccountAccess(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
) {
  const approver = await requireRole(["SUPER_ADMIN"]);
  const requestId = formField(formData, "requestId");
  if (!isUuidV7(requestId)) {
    redirect("/security?status=invalid-request");
  }

  const request = await db.orm.public.SecurityAccessRequest
    .where({ id: requestId })
    .select("id", "userId", "status")
    .first();
  if (!request) {
    redirect("/security?status=request-not-found");
  }
  if (String(request.status) !== "PENDING") {
    redirect("/security?status=request-already-decided");
  }

  const requester = await db.orm.public.User
    .where({ id: request.userId })
    .select("id", "role", "status")
    .first();
  if (!requester) {
    redirect("/security?status=request-not-found");
  }
  if (status === "APPROVED" && String(requester.status) !== "ACTIVE") {
    redirect("/security?status=account-inactive");
  }
  if (requester.id === approver.id && String(requester.role) === "SUPER_ADMIN") {
    redirect("/security?status=self-approval");
  }

  await db.orm.public.SecurityAccessRequest
    .where({ id: request.id, status: "PENDING" })
    .update({
      status,
      decidedAt: new Date(),
      decidedById: approver.id,
    });

  const decision = await db.orm.public.SecurityAccessRequest
    .where({ id: request.id })
    .select("status")
    .first();
  if (String(decision?.status) !== status) {
    redirect("/security?status=request-already-decided");
  }

  revalidatePath("/security");
  redirect(`/security?status=${status === "APPROVED" ? "approved" : "rejected"}`);
}

export async function approveAccountAccess(formData: FormData) {
  await decideAccountAccess(formData, "APPROVED");
}

export async function rejectAccountAccess(formData: FormData) {
  await decideAccountAccess(formData, "REJECTED");
}
