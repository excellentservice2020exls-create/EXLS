"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";

export async function updateProfile(formData: FormData) {
  const user = await requirePermission("profile:read:self");

  function readText(name: string) {
    const value = formData.get(name);
    if (typeof value !== "string") {
      redirect("/admin/profile?error=invalid");
    }
    return value.trim();
  }

  const lastName = readText("lastName");
  const postName = readText("postName");
  const firstName = readText("firstName");
  const residentialAddress = readText("residentialAddress");
  const residentialAddress2 = readText("residentialAddress2");
  const phone = readText("phone");
  const phone2 = readText("phone2");
  const birthPlace = readText("birthPlace");
  const birthDateValue = readText("birthDate");
  const studies = readText("studies");
  const educationLevel = readText("educationLevel");

  if (
    !lastName ||
    !firstName ||
    lastName.length > 100 ||
    postName.length > 100 ||
    firstName.length > 100 ||
    residentialAddress.length > 1000 ||
    residentialAddress2.length > 1000 ||
    phone.length > 40 ||
    phone2.length > 40 ||
    birthPlace.length > 200 ||
    studies.length > 2000 ||
    educationLevel.length > 150
  ) {
    redirect("/admin/profile?error=invalid");
  }

  let birthDate: Date | null = null;
  if (birthDateValue) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDateValue);
    if (!match) {
      redirect("/admin/profile?error=invalid");
    }

    const [, yearValue, monthValue, dayValue] = match;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    birthDate = new Date(Date.UTC(year, month - 1, day));
    if (
      birthDate.getUTCFullYear() !== year ||
      birthDate.getUTCMonth() !== month - 1 ||
      birthDate.getUTCDate() !== day ||
      birthDate.getTime() > Date.now()
    ) {
      redirect("/admin/profile?error=invalid");
    }
  }

  await db.orm.public.User
    .where({ id: user.id })
    .update({
      lastName,
      postName: postName || null,
      firstName,
      residentialAddress: residentialAddress || null,
      residentialAddress2: residentialAddress2 || null,
      phone: phone || null,
      phone2: phone2 || null,
      birthPlace: birthPlace || null,
      birthDate,
      studies: studies || null,
      educationLevel: educationLevel || null,
      updatedAt: new Date(),
    });

  redirect("/admin/profile?status=updated");
}
