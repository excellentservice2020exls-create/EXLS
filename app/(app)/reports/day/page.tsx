import {
  getAccessibleShifts,
  getAttendanceForShift,
  getDashboardStats,
  getShifts,
  getSiteById,
} from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { hasRole, MANAGEMENT_ROLES, requirePermission, type AppUser } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function ReportsDayPage() {
  const user = await requirePermission("reports:read");
  noStore();
  const shifts = await getAccessibleShifts(user);
  const reportStats = await getReportStats(user, shifts);
  const rows = await Promise.all(
    shifts.map(async (shift) => ({
      shift,
      site: await getSiteById(shift.siteId),
    })),
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Rapports</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Présence du jour</h1>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Mission</th>
              <th className="px-4 py-3 font-semibold">Site</th>
              <th className="px-4 py-3 font-semibold">Début</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ shift, site }) => (
              <tr key={shift.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{shift.title}</td>
                <td className="px-4 py-3 text-slate-600">{site?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(shift.startTime).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{String(shift.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Synthèse</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Agents actifs</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{reportStats.activeUsers}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Missions actives</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{reportStats.activeShifts}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Présences vérifiées</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{reportStats.verifiedAttendances}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getReportStats(
  user: AppUser,
  shifts: Awaited<ReturnType<typeof getShifts>>,
) {
  if (hasRole(user, MANAGEMENT_ROLES)) {
    return getDashboardStats();
  }

  const attendances = (await Promise.all(
    shifts.map((shift) => getAttendanceForShift(shift.id)),
  )).flat();
  return {
    activeUsers: new Set(shifts.map((shift) => shift.agentId)).size,
    activeShifts: shifts.filter((shift) => String(shift.status) !== "COMPLETED").length,
    verifiedAttendances: attendances.filter(
      (attendance) => String(attendance.status) === "VERIFIED",
    ).length,
  };
}
