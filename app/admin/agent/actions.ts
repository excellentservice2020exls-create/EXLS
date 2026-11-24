"use server";

import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { requirePermission } from "@/lib/erp-auth";
import { isUuidV7 } from "@/lib/utils";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function createAgentTraining(formData: FormData) {
  await requirePermission("employees:create");
  const agentId = field(formData, "agentId");
  const trainingDate = field(formData, "trainingDate");
  const subject = field(formData, "subject");
  const trainer = field(formData, "trainer");

  if (!isUuidV7(agentId) || !isDate(trainingDate) || !subject || !trainer) {
    redirect("/admin/agent?error=formation-invalid");
  }

  const agent = await db.orm.public.User.where({ id: agentId, role: "AGENT" }).select("id").first();
  if (!agent) redirect("/admin/agent?error=agent-missing");

  await db.orm.public.AgentTraining.create({
    agentId,
    trainingDate,
    subject,
    trainer,
  });

  redirect("/admin/agent?status=formation-created");
}

export async function getAgentTrainings() {
  const trainings = await db.orm.public.AgentTraining
    .orderBy((training) => training.trainingDate.desc())
    .all();
  const agents = await db.orm.public.User.select("id", "firstName", "postName", "lastName").all();
  const names = new Map(agents.map((agent) => [String(agent.id), `${agent.lastName} ${agent.postName ?? ""} ${agent.firstName}`.replace(/\s+/g, " ").trim()]));

  return trainings.map((training) => ({
    ...training,
    agentName: names.get(String(training.agentId)) ?? "Agent inconnu",
  }));
}
