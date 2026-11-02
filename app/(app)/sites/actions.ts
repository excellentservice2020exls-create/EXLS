"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";

type SiteInput = {
  name: string;
  code: string;
  clientId: number;
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
  isActive: boolean;
};

function readSiteInput(formData: FormData): SiteInput | null {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const clientId = Number(formData.get("clientId"));
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const latitudeValue = String(formData.get("latitude") ?? "").trim();
  const longitudeValue = String(formData.get("longitude") ?? "").trim();
  const geofenceRadius = Number(formData.get("geofenceRadius"));
  const latitude = latitudeValue === "" ? null : Number(latitudeValue);
  const longitude = longitudeValue === "" ? null : Number(longitudeValue);

  if (
    name.length < 2 || name.length > 120 ||
    !/^[A-Z0-9][A-Z0-9-]{0,31}$/.test(code) ||
    !Number.isSafeInteger(clientId) || clientId <= 0 ||
    address.length < 2 || address.length > 240 ||
    city.length < 2 || city.length > 100 ||
    postalCode.length < 1 || postalCode.length > 20 ||
    !Number.isInteger(geofenceRadius) || geofenceRadius < 10 || geofenceRadius > 5000 ||
    (latitude === null) !== (longitude === null) ||
    (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
    (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
  ) {
    return null;
  }

  return {
    name,
    code,
    clientId,
    address,
    city,
    postalCode,
    latitude,
    longitude,
    geofenceRadius,
    isActive: formData.get("isActive") === "on",
  };
}

async function validateSiteReferences(input: SiteInput, currentSiteId?: number) {
  const [client, existingSite] = await Promise.all([
    db.orm.public.Client.where({ id: input.clientId }).select("id").first(),
    db.orm.public.Site.where({ code: input.code }).select("id").first(),
  ]);

  if (!client) {
    return "client";
  }
  if (existingSite && existingSite.id !== currentSiteId) {
    return "code";
  }

  return null;
}

export async function createSite(formData: FormData) {
  await requirePermission("sites:create");
  const input = readSiteInput(formData);
  if (!input) {
    redirect("/sites/new?error=invalid");
  }

  const referenceError = await validateSiteReferences(input);
  if (referenceError) {
    redirect(`/sites/new?error=${referenceError}`);
  }

  await db.orm.public.Site.create(input);
  redirect("/sites?status=created");
}

export async function updateSite(siteId: string, formData: FormData) {
  await requirePermission("sites:update");
  const parsedSiteId = Number(siteId);
  if (!Number.isSafeInteger(parsedSiteId) || parsedSiteId <= 0) {
    redirect("/sites?error=not-found");
  }

  const existingSite = await db.orm.public.Site
    .where({ id: parsedSiteId })
    .select("id")
    .first();
  if (!existingSite) {
    redirect("/sites?error=not-found");
  }

  const input = readSiteInput(formData);
  if (!input) {
    redirect(`/sites/${parsedSiteId}/edit?error=invalid`);
  }

  const referenceError = await validateSiteReferences(input, parsedSiteId);
  if (referenceError) {
    redirect(`/sites/${parsedSiteId}/edit?error=${referenceError}`);
  }

  await db.orm.public.Site.where({ id: parsedSiteId }).update(input);
  redirect("/sites?status=updated");
}
