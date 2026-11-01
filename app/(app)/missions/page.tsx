import Link from "next/link";
import { getAccessibleShifts, getAgentById, getSiteById } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { hasPermission, requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const user = await requirePermission("missions:read");
  noStore();
  const shifts = await getAccessibleShifts(user);
  const rows = await Promise.all(
    shifts.map(async (shift) => {
      const site = await getSiteById(shift.siteId);
      const agent = await getAgentById(shift.agentId);
      return { shift, site, agent };
    }),
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Missions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Planification des missions</h1>
        </div>
        {hasPermission(user, "missions:create") && (
          <Link href="/missions/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            + Nouvelle mission
          </Link>
        )}
      </header>

      <div className="space-y-4">
        {rows.map(({ shift, site, agent }) => (
          <article key={shift.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{site?.name ?? "Site"}</h2>
                <p className="mt-1 text-sm text-slate-500">{new Date(shift.startTime).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{String(shift.status)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{agent ? `${agent.firstName} ${agent.lastName}` : "Agent non assigné"}</span>
              <Link href={`/attendance?shiftId=${shift.id}&date=${dateValue(shift.startTime)}`} className="font-medium text-emerald-700 hover:text-emerald-600">Ouvrir pointage</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function dateValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
