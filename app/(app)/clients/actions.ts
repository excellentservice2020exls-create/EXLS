"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";

export async function createClient(formData: FormData) {
  await requirePermission("clients:create");
  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();

  if (!name || !contactName) {
    return;
  }

  const code = `CLI-${Date.now().toString().slice(-6)}`;

  await db.orm.public.Client.create({
    name,
    code,
    contactName,
    contactEmail: contactEmail || `${code.toLowerCase()}@exls.local`,
    contactPhone: contactPhone || "",
    billingAddress: billingAddress || "",
    city: city || "Kinshasa",
    postalCode: postalCode || "",
  });

  redirect("/clients");
}
