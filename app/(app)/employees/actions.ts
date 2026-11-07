"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";
import { isUuidV7 } from "@/lib/utils";

const genders = ["FEMININ", "MASCULIN", "AUTRE"] as const;

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
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
    redirect("/employees/new?error=application-invalid#application-form");
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

  redirect("/employees?tab=all&status=application-created");
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
    redirect("/employees/new?error=identity-invalid#identity-form");
  }

  const application = await db.orm.public.AgentApplication
    .where({ id: agentApplicationId })
    .select("id")
    .first();
  if (!application) {
    redirect("/employees/new?error=application-missing#identity-form");
  }

  const existingIdentity = await db.orm.public.AgentIdentity
    .where({ agentApplicationId })
    .select("id")
    .first();
  if (existingIdentity) {
    redirect("/employees/new?error=identity-exists#identity-form");
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

  redirect("/employees?tab=all&status=identity-created");
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
    redirect("/employees");
  }

  await requirePermission(
    status === "ACTIVE" ? "employees:restore" : "employees:archive",
  );
  if (!isUuidV7(applicationId)) {
    redirect("/employees");
  }

  if (source === "application") {
    const application = await db.orm.public.AgentApplication
      .where({ id: applicationId })
      .select("id")
      .first();
    if (!application) {
      redirect("/employees");
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
      redirect("/employees");
    }

    await db.orm.public.User
      .where({ id: applicationId, role: "AGENT" })
      .update({ status, updatedAt: new Date() });
  }

  redirect(
    `/employees?tab=${status === "ACTIVE" ? "all" : "inactive"}&status=${status === "ACTIVE" ? "restored" : "archived"}`,
  );
}
