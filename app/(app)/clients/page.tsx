import Link from "next/link";
import { getClients } from "@/lib/erp-data";
import { unstable_noStore as noStore } from "next/cache";
import { requirePermission } from "@/lib/erp-auth";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requirePermission("clients:read");
  noStore();
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Abonnés / Clients</h1>
        </div>
        <Link href="/clients/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
          + Nouveau client
        </Link>
      </header>

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
              <div className="flex justify-between gap-4"><dt>Contact</dt><dd>{client.contactName}</dd></div>
              <div className="flex justify-between gap-4"><dt>Email</dt><dd>{client.contactEmail}</dd></div>
              <div className="flex justify-between gap-4"><dt>Téléphone</dt><dd>{client.contactPhone}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
