"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { MANAGEMENT_ROLES, requireAppUser, requireRole, SUPERVISOR_ROLES } from "@/lib/erp-auth";

function parseId(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return /^[1-9]\d*$/.test(text) ? Number(text) : 0;
}

function dateValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseClockIn(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hour, minute);
  if (
    value.getFullYear() !== year || value.getMonth() !== month - 1 ||
    value.getDate() !== day || value.getHours() !== hour || value.getMinutes() !== minute
  ) {
    return null;
  }

  return value;
}

function returnToAttendance(shiftId: number, date: string, error?: string): never {
  const params = new URLSearchParams({ shiftId: String(shiftId), date });
  if (error) params.set("error", error);
  redirect(`/attendance?${params.toString()}`);
}

export async function createAttendanceRecord(formData: FormData) {
  const user = await requireAppUser();
  const shiftId = parseId(formData.get("shiftId"));
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!shiftId) {
    returnToAttendance(0, "", "invalid");
  }

  const shift = await db.orm.public.Shift
    .where({ id: shiftId })
    .select("id", "agentId", "supervisorId", "startTime", "endTime", "status")
    .first();

  if (!shift) {
    returnToAttendance(shiftId, date, "shift_not_found");
  }

  const role = String(user.role);
  const canManageAll = (MANAGEMENT_ROLES as readonly string[]).includes(role);
  const canSuperviseShift = role === "SUPERVISOR" && shift.supervisorId === user.id;
  const isAssignedAgent = role === "AGENT" && shift.agentId === user.id;
  if (!canManageAll && !canSuperviseShift && !isAssignedAgent) {
    notFound();
  }

  if (!["SCHEDULED", "IN_PROGRESS"].includes(String(shift.status))) {
    returnToAttendance(shiftId, dateValue(shift.startTime), "shift_closed");
  }

  const clockInTime = parseClockIn(date, time);
  const startDate = dateValue(shift.startTime);
  const endDate = dateValue(shift.endTime);
  if (!clockInTime || date < startDate || date > endDate || clockInTime > shift.endTime) {
    returnToAttendance(shiftId, startDate, "invalid_time");
  }

  const existingAttendance = await db.orm.public.Attendance.where({ shiftId }).first();
  if (existingAttendance) {
    returnToAttendance(shiftId, startDate, "already_recorded");
  }

  const lateMinutes = Math.max(0, Math.ceil((clockInTime.getTime() - shift.startTime.getTime()) / 60_000));
  await db.orm.public.Attendance.create({
    shiftId,
    agentId: shift.agentId,
    clockInTime,
    clockInMethod: isAssignedAgent ? "MANUAL" : "SUPERVISOR_OVERRIDE",
    lateMinutes,
    status: lateMinutes > 0 ? "LATE" : "ON_TIME",
  });

  returnToAttendance(shiftId, startDate);
}

export async function verifyAttendance(formData: FormData) {
  const user = await requireRole(SUPERVISOR_ROLES);
  const attendanceId = parseId(formData.get("attendanceId"));
  if (!attendanceId) {
    notFound();
  }

  const attendance = await db.orm.public.Attendance
    .where({ id: attendanceId })
    .select("id", "shiftId", "status")
    .first();
  if (!attendance) {
    notFound();
  }

  const shift = await db.orm.public.Shift
    .where({ id: attendance.shiftId })
    .select("id", "startTime", "supervisorId")
    .first();
  if (!shift) {
    notFound();
  }

  if (String(user.role) === "SUPERVISOR" && shift.supervisorId !== user.id) {
    notFound();
  }

  if (String(attendance.status) !== "VERIFIED") {
    await db.orm.public.Attendance.where({ id: attendance.id }).update({
      status: "VERIFIED",
      verifiedById: user.id,
    });
  }

  returnToAttendance(shift.id, dateValue(shift.startTime));
}
