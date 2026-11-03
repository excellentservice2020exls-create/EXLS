import Link from "next/link";
import { getClients } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { hasPermission, requirePermission } from "@/lib/erp-auth";
import { ClientTabs } from "@/components/erp/client-tabs";
import { archiveClient } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: PageProps<"/clients">) {
  const user = await requirePermission("clients:read");
  noStore();
  const [{ status }, clients] = await Promise.all([searchParams, getClients()]);
  const statusMessages: Record<string, string> = {
    archived: "Le client a été archivé. Ses données sont conservées et peuvent être restaurées.",
    restored: "Le client a été restauré.",
    updated: "Les données du client ont été mises à jour.",
  };
  const statusMessage =
    typeof status === "string" ? statusMessages[status] : undefined;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Abonnés / Clients</h1>
        </div>
        {hasPermission(user, "clients:create") && (
          <Link href="/clients/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            + Nouveau client
          </Link>
        )}
      </header>

      <ClientTabs
        active="list"
        canArchive={hasPermission(user, "clients:archive")}
        canCreate={hasPermission(user, "clients:create")}
        canRead
      />

      {statusMessage && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Aucun client enregistré</h2>
          <p className="mt-2 text-sm text-slate-600">Les clients apparaîtront ici une fois créés.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article key={client.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{client.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{client.city}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{String(client.isActive) === "true" ? "Actif" : "Inactif"}</span>
              </div>
              <dl className="mt-5 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4"><dt>Codif: </dt><dd>{client.code}</dd></div>
                <div className="flex justify-between gap-4"><dt>Contact: </dt><dd>{client.contactName}</dd></div>
                <div className="flex justify-between gap-4"><dt>Email: </dt><dd>{client.contactEmail}</dd></div>
                <div className="flex justify-between gap-4"><dt>Téléphone: </dt><dd>{client.contactPhone}</dd></div>
              </dl>
              {(hasPermission(user, "clients:update") || hasPermission(user, "clients:archive")) && (
                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  {hasPermission(user, "clients:update") && (
                    <Link href={`/clients/${client.id}/edit`} className="cursor-pointer rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">
                      Modifier
                    </Link>
                  )}
                  {hasPermission(user, "clients:archive") && (
                    <form action={archiveClient.bind(null, String(client.id))}>
                      <button type="submit" className="cursor-pointer rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">
                        Archiver
                      </button>
                    </form>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
