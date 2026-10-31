import { MANAGEMENT_ROLES, requireRole } from "@/lib/erp-auth";

export default async function SettingsPage() {
  await requireRole(MANAGEMENT_ROLES);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Paramètres</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Référentiels EXLS</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Postes et grades</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Agent de sécurité</li>
            <li>• Superviseur de site</li>
            <li>• Responsable RH</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Types de présence</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Arrivée</li>
            <li>• Départ</li>
            <li>• Abandon de poste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
