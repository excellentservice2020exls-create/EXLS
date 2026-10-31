"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { MANAGEMENT_ROLES, requireRole } from "@/lib/erp-auth";

export async function createShift(formData: FormData) {
  await requireRole(MANAGEMENT_ROLES);
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const siteId = Number(formData.get("siteId") ?? "0");
  const agentId = Number(formData.get("agentId") ?? "0");

  if (
    !Number.isSafeInteger(siteId) || siteId <= 0 ||
    !Number.isSafeInteger(agentId) || agentId <= 0 ||
    title.length > 120 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    return;
  }

  const start = new Date(`${date}T${startTime}:00`);
  const [year, month, day] = date.split("-").map(Number);
  if (
    Number.isNaN(start.getTime()) ||
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    return;
  }
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);

  const [site, agent] = await Promise.all([
    db.orm.public.Site.where({ id: siteId }).select("id", "name", "isActive").first(),
    db.orm.public.User.where({ id: agentId }).select("id", "role", "status").first(),
  ]);
  if (
    !site || String(site.isActive) !== "true" ||
    !agent || String(agent.role) !== "AGENT" || String(agent.status) !== "ACTIVE"
  ) {
    return;
  }

  await db.orm.public.Shift.create({
    siteId: site.id,
    agentId: agent.id,
    title: title || `Mission ${site.name}`,
    shiftType: "DAY",
    startTime: start,
    endTime: end,
    status: "SCHEDULED",
  });

  redirect("/missions");
}
