"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";

export async function createClient(formData: FormData) {
  const user = await requirePermission("clients:create");
  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();

  if (!name || !contactName) {
    redirect("/clients/new?error=required-fields");
  }

  const code = `CLI-${Date.now().toString().slice(-6)}`;
  const createdAt = new Date();

  await db.orm.public.Client.create({
    name,
    code,
    contactName,
    contactEmail: contactEmail || `${code.toLowerCase()}@exls.local`,
    contactPhone: contactPhone || "",
    billingAddress: billingAddress || "",
    city: city || "Kinshasa",
    postalCode: postalCode || "",
    createdAt,
    createdByEmail: user.email,
    createdById: user.id,
    createdByName: user.name,
  });

  redirect("/clients");
}

export async function archiveClient(clientId: string) {
  await requirePermission("clients:archive");
  const id = Number(clientId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/clients");
  }

  const client = await db.orm.public.Client
    .where({ id })
    .where((currentClient) => currentClient.deletedAt.isNull())
    .select("id")
    .first();
  if (!client) {
    redirect("/clients");
  }

  await db.orm.public.Client
    .where({ id })
    .where((currentClient) => currentClient.deletedAt.isNull())
    .update({ deletedAt: new Date() });

  redirect("/clients?status=archived");
}

export async function restoreClient(clientId: string) {
  await requirePermission("clients:restore");
  const id = Number(clientId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/clients/archives");
  }

  const client = await db.orm.public.Client
    .where({ id })
    .where((currentClient) => currentClient.deletedAt.isNotNull())
    .select("id")
    .first();
  if (!client) {
    redirect("/clients/archives");
  }

  await db.orm.public.Client
    .where({ id })
    .where((currentClient) => currentClient.deletedAt.isNotNull())
    .update({ deletedAt: null });

  redirect("/clients?status=restored");
}
