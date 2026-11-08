import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientTabs } from "@/components/erp/client-tabs";
import { hasPermission, requirePermission } from "@/lib/erp-auth";
import { db } from "@/prisma/db";
import { isUuidV7 } from "@/lib/utils";
import { updateClient } from "../../actions";

export default async function EditClientPage({
  params,
  searchParams,
}: PageProps<"/clients/[clientId]/edit">) {
  const user = await requirePermission("clients:update");
  const [{ clientId }, { error }] = await Promise.all([params, searchParams]);
  const id = clientId;
  if (!isUuidV7(id)) {
    notFound();
  }

  const client = await db.orm.public.Client
    .where({ id })
    .where((currentClient) => currentClient.deletedAt.isNull())
    .select("id", "code", "name", "contactName", "contactEmail", "contactPhone", "city", "billingAddress", "postalCode", "isActive")
    .first();
  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Modifier le client</h1>
        <p className="mt-1 text-sm text-slate-500">Codif {client.code}</p>
      </header>

      <ClientTabs
        active="list"
        canArchive={hasPermission(user, "clients:archive")}
        canCreate={hasPermission(user, "clients:create")}
        canRead={hasPermission(user, "clients:read")}
      />

      {error === "required-fields" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Le nom du client et le nom du contact sont obligatoires.
        </p>
      )}

      <form action={updateClient.bind(null, String(client.id))} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Nom de l&apos;abonné</span>
          <input name="name" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.name} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Contact</span>
            <input name="contactName" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.contactName} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Téléphone</span>
            <input name="contactPhone" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.contactPhone} />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Email</span>
            <input name="contactEmail" type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.contactEmail} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Ville</span>
            <input name="city" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.city} />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Adresse</span>
            <textarea name="billingAddress" className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.billingAddress} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Code postal</span>
            <input name="postalCode" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue={client.postalCode} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={client.isActive} className="size-4 accent-emerald-600" />
          Client actif
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/clients" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Annuler</Link>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}