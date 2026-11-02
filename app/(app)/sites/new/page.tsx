import { SiteForm } from "@/components/erp/site-form";
import { createSite } from "../actions";
import { getClients } from "@/lib/erp-data";
import { requirePermission } from "@/lib/erp-auth";

const errorValues = ["invalid", "client", "code"] as const;

export default async function NewSitePage({
  searchParams,
}: PageProps<"/sites/new">) {
  await requirePermission("sites:create");
  const [{ error }, clients] = await Promise.all([searchParams, getClients()]);
  const formError = errorValues.find((value) => value === error);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Implantations</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Nouveau site</h1>
        <p className="mt-2 text-sm text-slate-600">Rattachez le site à un client et configurez son périmètre de géolocalisation.</p>
      </header>
      {clients.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Créez d’abord un client avant d’enregistrer un site.
        </p>
      )}
      <SiteForm
        action={createSite}
        clients={clients}
        error={formError}
        submitLabel="Créer le site"
      />
    </div>
  );
}
