import { ClientTabs } from "@/components/erp/client-tabs";
import { getClients } from "@/lib/erp-data";
import { hasPermission, requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

export default async function ClientSearchPage({
  searchParams,
}: PageProps<"/clients/search">) {
  const user = await requirePermission("clients:read");
  const [{ q }, clients] = await Promise.all([searchParams, getClients()]);
  const query = typeof q === "string" ? q.trim() : "";
  const normalizedQuery = normalizeSearchValue(query);
  const results = normalizedQuery
    ? clients.filter((client) =>
        [
          client.name,
          client.code,
          client.contactName,
          client.contactEmail,
          client.contactPhone,
          client.city,
        ].some((value) => normalizeSearchValue(value).includes(normalizedQuery)),
      )
    : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Recherche Client</h1>
      </header>

      <ClientTabs
        active="search"
        canArchive={hasPermission(user, "clients:archive")}
        canCreate={hasPermission(user, "clients:create")}
        canRead
      />

      <form action="/clients/search" method="get" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
        <label htmlFor="client-search" className="sr-only">Rechercher un client</label>
        <input
          id="client-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Nom, code, contact, e-mail, téléphone ou ville"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
          Rechercher
        </button>
      </form>

      {normalizedQuery && (
        <p role="status" className="text-sm text-slate-600">
          {results.length} résultat{results.length === 1 ? "" : "s"} pour « {query} »
        </p>
      )}

      {normalizedQuery && results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Aucun client trouvé</h2>
          <p className="mt-2 text-sm text-slate-600">Essayez avec un nom, un code, une ville ou les coordonnées d’un contact.</p>
        </div>
      ) : (
        results.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Ville</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((client) => (
                    <tr key={client.id} className="border-t border-slate-200">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{client.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.code}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{client.city}</td>
                      <td className="px-4 py-4">
                        <p className="text-slate-900">{client.contactName}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.contactEmail}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${String(client.isActive) === "true" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {String(client.isActive) === "true" ? "Actif" : "Inactif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
