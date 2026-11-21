import { ClientTabs } from "@/components/erp/client-tabs";
import { hasPermission, requirePermission } from "@/lib/erp-auth";
import { getArchivedClients } from "@/lib/erp-data";
import { restoreClient } from "../actions";

export const dynamic = "force-dynamic";

export default async function ArchivedClientsPage() {
  const user = await requirePermission("clients:read");
  const clients = await getArchivedClients();
  const canRestore = hasPermission(user, "clients:restore");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Clients archivés</h1>
        <p className="mt-2 text-sm text-slate-600">
          Les clients archivés et leurs données sont conservés. Vous pouvez les restaurer à tout moment.
        </p>
      </header>

      <ClientTabs
        active="archives"
        canArchive={hasPermission(user, "clients:archive")}
        canCreate={hasPermission(user, "clients:create")}
        canRead
      />

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Aucun client archivé</h2>
          <p className="mt-2 text-sm text-slate-600">Les clients archivés apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article key={client.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{client.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{client.code} · {client.city}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                  Archivé
                </span>
              </div>
              <dl className="mt-5 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4"><dt>Contact</dt><dd>{client.contactName}</dd></div>
                <div className="flex justify-between gap-4"><dt>Email</dt><dd>{client.contactEmail}</dd></div>
                <div className="flex justify-between gap-4"><dt>Téléphone</dt><dd>{client.contactPhone}</dd></div>
                <div className="flex justify-between gap-4"><dt>Archivé le</dt><dd>{client.deletedAt?.toLocaleDateString("fr-FR") ?? "—"}</dd></div>
              </dl>
              {canRestore && (
                <form action={restoreClient.bind(null, String(client.id))} className="mt-5 border-t border-slate-100 pt-4 text-right">
                  <button type="submit" className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">
                    Restaurer le client
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
