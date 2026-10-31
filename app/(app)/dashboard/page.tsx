import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardStats, getShifts, getSiteById } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { MANAGEMENT_ROLES, requireAppUser } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${accent}`}>Live</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireAppUser();
  if (!(MANAGEMENT_ROLES as readonly string[]).includes(String(user.role))) {
    redirect(String(user.role) === "SUPERVISOR" ? "/missions" : "/attendance");
  }
  noStore();
  const stats = await getDashboardStats();
  const shifts = await getShifts();
  const recentShifts = await Promise.all(
    shifts.slice(0, 5).map(async (shift) => ({
      shift,
      site: await getSiteById(shift.siteId),
    })),
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">EXLS</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Tableau de bord</h1>
        </div>
        <Link href="/missions/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500">
          + Nouvelle mission
        </Link>
      </header>

      <section className="grid gap-5 md:grid-cols-4">
        <StatCard label="Personnel" value={String(stats.users)} accent="bg-emerald-100 text-emerald-700" />
        <StatCard label="Clients" value={String(stats.clients)} accent="bg-sky-100 text-sky-700" />
        <StatCard label="Sites" value={String(stats.sites)} accent="bg-violet-100 text-violet-700" />
        <StatCard label="Missions actives" value={String(stats.activeShifts)} accent="bg-amber-100 text-amber-700" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Missions récentes</h2>
          <div className="mt-5 space-y-4">
            {recentShifts.map(({ shift, site }) => (
              <div key={shift.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-900">{site?.name ?? "Site non associé"}</p>
                  <p className="text-sm text-slate-500">{new Date(shift.startTime).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{String(shift.status)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Rappels</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl bg-amber-50 p-3 text-amber-800">{stats.activeUsers} agents actifs dans le système.</li>
            <li className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{stats.verifiedAttendances} présences vérifiées.</li>
            <li className="rounded-xl bg-sky-50 p-3 text-sky-800">{stats.clients} clients enregistrés dans EXLS.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
