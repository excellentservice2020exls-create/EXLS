import { createClient } from "../actions";
import { requirePermission } from "@/lib/erp-auth";

export default async function NewClientPage() {
  await requirePermission("clients:create");
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Clients</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Nouveau client</h1>
      </header>

      <form action={createClient} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Nom de l&apos;abonné</span>
          <input name="name" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Contact</span>
            <input name="contactName" className="w-full rounded-xl border border-slate-300 px-3 py-2" defaultValue="" />
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
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Annuler</button>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
