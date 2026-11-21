import { notFound } from "next/navigation";
import { SiteForm } from "@/components/erp/site-form";
import { updateSite } from "../../actions";
import { getClients, getSiteForManagement } from "@/lib/erp-data";
import { requirePermission } from "@/lib/erp-auth";
import { isUuidV7 } from "@/lib/utils";

const errorValues = ["invalid", "client", "code"] as const;

export default async function EditSitePage({
  params,
  searchParams,
}: PageProps<"/admin/sites/[siteId]/edit">) {
  await requirePermission("sites:update");
  const [{ siteId }, { error }] = await Promise.all([params, searchParams]);
  const parsedSiteId = siteId;
  if (!isUuidV7(parsedSiteId)) {
    notFound();
  }

  const [site, clients] = await Promise.all([
    getSiteForManagement(parsedSiteId),
    getClients(),
  ]);
  if (!site) {
    notFound();
  }

  const formError = errorValues.find((value) => value === error);
  const updateSiteForId = updateSite.bind(null, siteId);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Implantations</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Modifier {site.name}</h1>
        <p className="mt-2 text-sm text-slate-600">Mettez à jour les informations du site ou son statut d’activité.</p>
      </header>
      <SiteForm
        action={updateSiteForId}
        clients={clients}
        error={formError}
        submitLabel="Enregistrer les modifications"
        values={site}
      />
    </div>
  );
}
