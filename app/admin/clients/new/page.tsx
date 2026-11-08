import { createClient } from "../actions";
import { hasPermission, requirePermission } from "@/lib/erp-auth";
import { ClientTabs } from "@/components/erp/client-tabs";

export default async function NewClientPage({
  searchParams,
}: PageProps<"/clients/new">) {
  const user = await requirePermission("clients:create");
  const { error } = await searchParams;
  const createdAt = new Date();
  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(createdAt);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }).format(createdAt);

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Nouveau client</h1>
      </header>

      <ClientTabs
        active="new"
        canArchive={hasPermission(user, "clients:archive")}
        canCreate
        canRead={hasPermission(user, "clients:read")}
      />

      {error === "required-fields" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Le nom du client et le nom du contact sont obligatoires.
        </p>
      )}

      <form action={createClient} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Nom de l&apos;abonné</span>
          <input name="name" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Contact</span>
            <input name="contactName" required className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Téléphone</span>
            <input name="contactPhone" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Email</span>
            <input name="contactEmail" type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Ville</span>
            <input name="city" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="Kinshasa" />
          </label>
        </div>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Adresse</span>
          <textarea name="billingAddress" className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
        </label>
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">Informations automatiques</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span>DATE</span>
              <input aria-readonly="true" readOnly value={date} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>HEURE (UTC)</span>
              <input aria-readonly="true" readOnly value={time} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Utilisateur</span>
              <input aria-readonly="true" readOnly value={user.name} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Email utilisateur</span>
              <input aria-readonly="true" readOnly value={user.email} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>ID utilisateur</span>
              <input aria-readonly="true" readOnly value={user.id} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </label>
          </div>
        </fieldset>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Annuler</button>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
