import Link from "next/link";

type SiteFormValues = {
  name: string;
  code: string;
  clientId: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
  isActive: boolean;
};

type SiteFormProps = {
  action: (formData: FormData) => Promise<void>;
  clients: { id: string; name: string }[];
  error?: string;
  submitLabel: string;
  values?: Partial<SiteFormValues>;
};

const errorMessages: Record<string, string> = {
  invalid: "Vérifiez les informations saisies, notamment les coordonnées GPS.",
  client: "Le client sélectionné n’existe plus. Choisissez un autre client.",
  code: "Ce code de site est déjà utilisé.",
};

export function SiteForm({
  action,
  clients,
  error,
  submitLabel,
  values,
}: SiteFormProps) {
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {errorMessage && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Nom du site</span>
          <input name="name" required maxLength={120} defaultValue={values?.name ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Code du site</span>
          <input name="code" required maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9-]*" defaultValue={values?.code ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2 uppercase" />
        </label>
      </div>
      <label className="block space-y-2 text-sm text-slate-600">
        <span>Client rattaché</span>
        <select name="clientId" required defaultValue={values?.clientId ?? ""} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
          <option value="" disabled>Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-2 text-sm text-slate-600">
        <span>Adresse</span>
        <input name="address" required maxLength={240} defaultValue={values?.address ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Ville</span>
          <input name="city" required maxLength={100} defaultValue={values?.city ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span>Code postal</span>
          <input name="postalCode" required maxLength={20} defaultValue={values?.postalCode ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Géolocalisation et pointage</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Latitude</span>
            <input name="latitude" type="number" step="any" min="-90" max="90" defaultValue={values?.latitude ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Longitude</span>
            <input name="longitude" type="number" step="any" min="-180" max="180" defaultValue={values?.longitude ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Rayon de géolocalisation (m)</span>
            <input name="geofenceRadius" type="number" min="10" max="5000" required defaultValue={values?.geofenceRadius ?? 100} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
        </div>
        <p className="text-xs text-slate-500">Saisissez latitude et longitude ensemble pour activer le contrôle GPS.</p>
      </fieldset>
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input name="isActive" type="checkbox" defaultChecked={values?.isActive ?? true} className="size-4 rounded border-slate-300 text-emerald-600" />
        Site actif
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Link href="/sites" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Annuler
        </Link>
        <button type="submit" disabled={clients.length === 0} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
