import { createShift } from "../actions";
import { getEmployees, getSites } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function NewMissionPage() {
  await requirePermission("missions:create");
  noStore();
  const sites = await getSites();
  const agents = (await getEmployees()).filter(
    (employee) => String(employee.role) === "AGENT" && String(employee.status) === "ACTIVE",
  );

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Missions</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Créer une mission</h1>
      </header>

      <form action={createShift} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Site</span>
          <select name="siteId" className="w-full rounded-xl border border-slate-300 px-3 py-2">
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Agent affecté</span>
          <select name="agentId" required className="w-full rounded-xl border border-slate-300 px-3 py-2">
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName} · {agent.matricule}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Libellé de la mission</span>
          <input name="title" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Date</span>
            <input name="date" type="date" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Heure prévue</span>
            <input name="startTime" type="time" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="07:00" />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Annuler</button>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
