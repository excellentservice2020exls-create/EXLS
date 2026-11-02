import Link from "next/link";
import { getClients, getSitesForManagement } from "@/lib/erp-data";
import { hasPermission, requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

const statusMessages: Record<string, string> = {
  created: "Le site a été créé.",
  updated: "Le site a été mis à jour.",
};

const errorMessages: Record<string, string> = {
  "not-found": "Le site demandé n’existe plus.",
};

export default async function SitesPage({
  searchParams,
}: PageProps<"/sites">) {
  const user = await requirePermission("sites:read");
  const [{ status, error }, sites, clients] = await Promise.all([
    searchParams,
    getSitesForManagement(),
    getClients(),
  ]);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const statusMessage = typeof status === "string" ? statusMessages[status] : undefined;
  const errorMessage = typeof error === "string" ? errorMessages[error] : undefined;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Implantations</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Gestion des sites</h1>
          <p className="mt-2 text-sm text-slate-600">{sites.length} site{sites.length === 1 ? "" : "s"} enregistré{sites.length === 1 ? "" : "s"}</p>
        </div>
        {hasPermission(user, "sites:create") && (
          <Link href="/sites/new" className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            + Nouveau site
          </Link>
        )}
      </header>

      {statusMessage && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Aucun site enregistré</h2>
          <p className="mt-2 text-sm text-slate-600">Créez un site pour le rattacher à un client et planifier des missions.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Site</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Localisation</th>
                  <th className="px-4 py-3 font-semibold">Pointage GPS</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => {
                  const isActive = String(site.isActive) === "true";
                  return (
                    <tr key={site.id} className="border-t border-slate-200">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{site.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{site.code}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{clientNames.get(site.clientId) ?? "Client introuvable"}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>{site.city}</p>
                        <p className="mt-1 text-xs text-slate-500">{site.address}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{site.geofenceRadius} m</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {hasPermission(user, "sites:update") && (
                          <Link href={`/sites/${site.id}/edit`} className="font-medium text-emerald-700 hover:text-emerald-600">
                            Modifier
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
