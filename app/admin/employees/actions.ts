"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuidV7 } from "@/lib/utils";

const genders = ["FEMININ", "MASCULIN", "AUTRE"] as const;
const allowedIdentityDocumentTypes = [
  "identity-card",
  "passport",
  "police-report",
] as const;
const maxDocumentSize = 5 * 1024 * 1024;
const documentBucket = "agent-documents";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function uploadedFile(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function isAllowedIdentityDocumentType(
  value: string,
): value is (typeof allowedIdentityDocumentTypes)[number] {
  return allowedIdentityDocumentTypes.some((type) => type === value);
}

async function getDocumentContentType(file: File, imagesOnly = false) {
  if (file.size > maxDocumentSize) {
    return "too-large" as const;
  }

  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPdf =
    header.length >= 5 &&
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46 &&
    header[4] === 0x2d;
  const isJpeg =
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff;
  const isPng =
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;

  if (isPdf && !imagesOnly) return "application/pdf";
  if (isJpeg) return "image/jpeg";
  if (isPng) return "image/png";
  return null;
}

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isGender(value: string): value is (typeof genders)[number] {
  return genders.some((gender) => gender === value);
}

export async function createAgentApplication(formData: FormData) {
  await requirePermission("employees:create");
  const firstName = field(formData, "firstName");
  const postName = field(formData, "postName");
  const lastName = field(formData, "lastName");
  const gender = field(formData, "gender");
  const birthPlace = field(formData, "birthPlace");
  const birthDate = field(formData, "birthDate");
  const nationality = field(formData, "nationality");
  const residentialAddress = field(formData, "residentialAddress");
  const phone = field(formData, "phone");
  const educationLevel = field(formData, "educationLevel");

  if (
    !firstName ||
    !postName ||
    !lastName ||
    !isGender(gender) ||
    !birthPlace ||
    !isDate(birthDate) ||
    !nationality ||
    !residentialAddress ||
    !phone ||
    !educationLevel
  ) {
    redirect("/admin/employees/new?error=application-invalid#application-form");
  }

  await db.orm.public.AgentApplication.create({
    firstName,
    postName,
    lastName,
    gender,
    birthPlace,
    birthDate,
    nationality,
    residentialAddress,
    residentialAddress2: field(formData, "residentialAddress2") || null,
    phone,
    phone2: field(formData, "phone2") || null,
    educationLevel,
    status: "ACTIVE",
  });

  redirect("/admin/employees?tab=all&status=application-created");
}

export async function createAgentIdentity(formData: FormData) {
  await requirePermission("employees:create");
  const agentApplicationId = field(formData, "agentApplicationId");
  const firstName = field(formData, "firstName");
  const postName = field(formData, "postName");
  const lastName = field(formData, "lastName");
  const gender = field(formData, "gender");
  const birthPlace = field(formData, "birthPlace");
  const birthDate = field(formData, "birthDate");
  const nationality = field(formData, "nationality");
  const phone = field(formData, "phone");

  if (
    !isUuidV7(agentApplicationId) ||
    !firstName ||
    !postName ||
    !lastName ||
    !isGender(gender) ||
    !birthPlace ||
    !isDate(birthDate) ||
    !nationality ||
    !phone ||
    !field(formData, "province") ||
    !field(formData, "district") ||
    !field(formData, "territory") ||
    !field(formData, "sector") ||
    !field(formData, "maritalStatus") ||
    !field(formData, "fatherName") ||
    !field(formData, "motherName") ||
    !field(formData, "residentialAddress")
  ) {
    redirect("/admin/employees/new?error=identity-invalid#identity-form");
  }

  const application = await db.orm.public.AgentApplication
    .where({ id: agentApplicationId })
    .select("id")
    .first();
  if (!application) {
    redirect("/admin/employees/new?error=application-missing#identity-form");
  }

  const existingIdentity = await db.orm.public.AgentIdentity
    .where({ agentApplicationId })
    .select("id")
    .first();
  if (existingIdentity) {
    redirect("/admin/employees/new?error=identity-exists#identity-form");
  }

  await db.orm.public.AgentIdentity.create({
    agentApplicationId,
    firstName,
    postName,
    lastName,
    gender,
    birthPlace,
    birthDate,
    nationality,
    province: field(formData, "province"),
    district: field(formData, "district"),
    territory: field(formData, "territory"),
    sector: field(formData, "sector"),
    maritalStatus: field(formData, "maritalStatus"),
    fatherName: field(formData, "fatherName"),
    motherName: field(formData, "motherName"),
    residentialAddress: field(formData, "residentialAddress"),
    residentialAddress2: field(formData, "residentialAddress2") || null,
    phone,
    phone2: field(formData, "phone2") || null,
    studies: field(formData, "studies") || null,
    professionalExperiences: field(formData, "professionalExperiences") || null,
    additionalTrainings: field(formData, "additionalTrainings") || null,
    spokenLanguages: field(formData, "spokenLanguages") || null,
  });

  redirect("/admin/employees?tab=all&status=identity-created");
}

export async function uploadAgentDocuments(formData: FormData) {
  await requirePermission("employees:create");
  const agentApplicationId = field(formData, "agentApplicationId");
  const identityDocumentType = field(formData, "identityDocumentType");

  if (
    !isUuidV7(agentApplicationId) ||
    !isAllowedIdentityDocumentType(identityDocumentType)
  ) {
    redirect("/admin/employees/new?error=documents-invalid#documents-form");
  }

  const application = await db.orm.public.AgentApplication
    .where({ id: agentApplicationId })
    .select("id")
    .first();
  if (!application) {
    redirect("/admin/employees/new?error=application-missing#documents-form");
  }

  const files = [
    { name: "curriculumVitae", key: "curriculum-vitae", imagesOnly: false },
    {
      name: "identityDocument",
      key: "identity-document",
      imagesOnly: false,
    },
    { name: "passportPhoto1", key: "passport-photo-1", imagesOnly: true },
    { name: "passportPhoto2", key: "passport-photo-2", imagesOnly: true },
    { name: "diploma", key: "diploma", imagesOnly: false },
    { name: "goodConductCertificate", key: "good-conduct-certificate", imagesOnly: false },
  ].map((document) => ({
    ...document,
    file: uploadedFile(formData, document.name),
  }));

  if (files.some(({ file }) => !file)) {
    redirect("/admin/employees/new?error=documents-invalid#documents-form");
  }

  const validatedFiles = [];
  for (const { file, ...document } of files) {
    if (!file) {
      redirect("/admin/employees/new?error=documents-invalid#documents-form");
    }
    const contentType = await getDocumentContentType(file, document.imagesOnly);
    if (contentType === "too-large") {
      redirect("/admin/employees/new?error=document-too-large#documents-form");
    }
    if (!contentType) {
      redirect("/admin/employees/new?error=documents-invalid#documents-form");
    }
    validatedFiles.push({ ...document, file, contentType });
  }

  const storage = createAdminClient().storage.from(documentBucket);
  for (const { key, file, contentType } of validatedFiles) {
    const { error } = await storage.upload(
      `${agentApplicationId}/${key}`,
      file,
      { contentType, upsert: true },
    );
    if (error) {
      console.error("Failed to upload agent document.", error);
      redirect("/admin/employees/new?error=document-upload-failed#documents-form");
    }
  }

  redirect("/admin/employees/new?status=documents-uploaded#documents-form");
}

export async function changeAgentStatus(
  source: "application" | "account",
  applicationId: string,
  status: "ACTIVE" | "ARCHIVED",
) {
  if (
    (source !== "application" && source !== "account") ||
    (status !== "ACTIVE" && status !== "ARCHIVED")
  ) {
    redirect("/admin/employees");
  }

  await requirePermission(
    status === "ACTIVE" ? "employees:restore" : "employees:archive",
  );
  if (!isUuidV7(applicationId)) {
    redirect("/admin/employees");
  }

  if (source === "application") {
    const application = await db.orm.public.AgentApplication
      .where({ id: applicationId })
      .select("id")
      .first();
    if (!application) {
      redirect("/admin/employees");
    }

    await db.orm.public.AgentApplication
      .where({ id: applicationId })
      .update({ status, updatedAt: new Date() });
  } else if (source === "account") {
    const agent = await db.orm.public.User
      .where({ id: applicationId, role: "AGENT" })
      .select("id")
      .first();
    if (!agent) {
      redirect("/admin/employees");
    }

    await db.orm.public.User
      .where({ id: applicationId, role: "AGENT" })
      .update({ status, updatedAt: new Date() });
  }

  redirect(
    `/admin/employees?tab=${status === "ACTIVE" ? "all" : "inactive"}&status=${status === "ACTIVE" ? "restored" : "archived"}`,
  );
}
