import { db } from "@/prisma/db";
import { unstable_noStore as noStore } from "next/cache";

export async function getDashboardStats() {
  noStore();
  const [clients, users, sites, shifts, attendanceRecords] = await Promise.all([
    db.orm.public.Client.select("id").all(),
    db.orm.public.User.select("id", "status").all(),
    db.orm.public.Site.select("id").all(),
    db.orm.public.Shift.select("id", "status", "startTime").all(),
    db.orm.public.Attendance.select("id", "status").all(),
  ]);

  const activeUsers = users.filter((user) => String(user.status) === "ACTIVE").length;
  const activeShifts = shifts.filter((shift) => String(shift.status) !== "COMPLETED").length;
  const verifiedAttendances = attendanceRecords.filter((record) => String(record.status) === "VERIFIED").length;

  return {
    clients: clients.length,
    users: users.length,
    sites: sites.length,
    activeUsers,
    activeShifts,
    verifiedAttendances,
  };
}

export async function getEmployees() {
  noStore();
  return db.orm.public.User
    .select("id", "firstName", "lastName", "phone", "role", "status", "matricule")
    .orderBy((user) => user.firstName.asc())
    .all();
}

export async function getClients() {
  noStore();
  return db.orm.public.Client
    .select("id", "name", "contactName", "contactEmail", "contactPhone", "city", "isActive")
    .orderBy((client) => client.name.asc())
    .all();
}

export async function getShifts(date?: string) {
  noStore();
  if (!date) {
    return db.orm.public.Shift
      .select("id", "title", "startTime", "endTime", "status", "siteId", "agentId", "supervisorId")
      .orderBy((shift) => shift.startTime.desc())
      .all();
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  return db.orm.public.Shift
    .where((shift) => shift.startTime.gte(start))
    .where((shift) => shift.startTime.lte(end))
    .select("id", "title", "startTime", "endTime", "status", "siteId", "agentId", "supervisorId")
    .orderBy((shift) => shift.startTime.asc())
    .all();
}

export async function getSites() {
  noStore();
  return db.orm.public.Site
    .select("id", "name", "code", "clientId")
    .orderBy((site) => site.name.asc())
    .all();
}

export async function getSiteById(siteId: number) {
  noStore();
  return db.orm.public.Site.where({ id: siteId }).select("id", "name", "code").first();
}

export async function getAgentById(agentId: number) {
  noStore();
  return db.orm.public.User.where({ id: agentId }).select("id", "firstName", "lastName", "role", "status").first();
}

export async function getAttendanceForShift(shiftId: number) {
  noStore();
  return db.orm.public.Attendance
    .where({ shiftId })
    .select("id", "shiftId", "agentId", "clockInTime", "clockOutTime", "status", "lateMinutes", "verifiedById")
    .orderBy((attendance) => attendance.clockInTime.asc())
    .all();
}
