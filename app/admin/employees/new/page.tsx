import Link from "next/link";
import { AgentTabs } from "@/components/erp/agent-tabs";
import {
  getAgentApplicationsWithoutIdentity,
} from "@/lib/erp-data";
import { requirePermission } from "@/lib/erp-auth";
import { createAgentApplication, createAgentIdentity } from "../actions";

const errorMessages: Record<string, string> = {
  "application-invalid": "Vérifiez les champs obligatoires du formulaire de candidature.",
  "identity-invalid": "Vérifiez les champs obligatoires du formulaire d’identité.",
  "application-missing": "L’agent sélectionné n’existe plus. Choisissez un dossier valide.",
  "identity-exists": "Un dossier d’identité existe déjà pour cet agent.",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";

function TextField({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: React.ComponentProps<"input">["type"];
  required?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-600">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-600">
      <span>{label}</span>
      <textarea name={name} rows={3} className={inputClass} />
    </label>
  );
}

function GenderField() {
  return (
    <label className="space-y-2 text-sm text-slate-600">
      <span>GENRE</span>
      <select name="gender" required defaultValue="" className={inputClass}>
        <option value="" disabled>Sélectionner</option>
        <option value="FEMININ">Féminin</option>
        <option value="MASCULIN">Masculin</option>
        <option value="AUTRE">Autre</option>
      </select>
    </label>
  );
}

export default async function NewEmployeePage({
  searchParams,
}: PageProps<"/employees/new">) {
  await requirePermission("employees:create");
  const [{ error }, applications] = await Promise.all([
    searchParams,
    getAgentApplicationsWithoutIdentity(),
  ]);
  const errorMessage =
    typeof error === "string" ? errorMessages[error] : undefined;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">AGENT</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Enregistrement d’un agent</h1>
      </header>

      <AgentTabs active="new" />

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <section id="application-form" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Formulaire de candidature</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enregistrez le dossier de candidature. Il sera ajouté à la liste des agents actifs.
          </p>
        </div>
        <form action={createAgentApplication} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="lastName" label="NOM" required />
            <TextField name="postName" label="POSTNOM" required />
            <TextField name="firstName" label="PRÉNOM" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <GenderField />
            <TextField name="nationality" label="NATIONALITÉ" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="birthPlace" label="LIEU DE NAISSANCE" required />
            <TextField name="birthDate" label="DATE DE NAISSANCE" type="date" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="residentialAddress" label="ADRESSE RÉSIDENTIELLE 1" required />
            <TextField name="residentialAddress2" label="ADRESSE RÉSIDENTIELLE 2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="phone" label="NUMÉRO 1 DE CONTACT" type="tel" required />
            <TextField name="phone2" label="NUMÉRO 2 DE CONTACT" type="tel" />
          </div>
          <TextField name="educationLevel" label="NIVEAU D’ÉTUDES" required />
          <div className="flex justify-end">
            <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
              Enregistrer la candidature
            </button>
          </div>
        </form>
      </section>

      <section id="identity-form" className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Formulaire d’identité</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ce dossier est enregistré séparément et rattaché à une candidature existante.
          </p>
        </div>
        <form action={createAgentIdentity} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="space-y-2 text-sm text-slate-600">
            <span>AGENT À IDENTIFIER</span>
            <select
              name="agentApplicationId"
              required
              defaultValue=""
              disabled={applications.length === 0}
              className={inputClass}
            >
              <option value="" disabled>Sélectionner une candidature</option>
              {applications.map((application) => (
                <option key={String(application.id)} value={String(application.id)}>
                  {application.lastName} {application.postName} {application.firstName} — {application.phone}
                </option>
              ))}
            </select>
          </label>
          {applications.length === 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Enregistrez d’abord une candidature sans dossier d’identité associé.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <TextField name="lastName" label="NOM" required />
            <TextField name="postName" label="POSTNOM" required />
            <TextField name="firstName" label="PRÉNOM" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <GenderField />
            <TextField name="nationality" label="NATIONALITÉ" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="birthPlace" label="LIEU DE NAISSANCE" required />
            <TextField name="birthDate" label="DATE DE NAISSANCE" type="date" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="province" label="PROVINCE" required />
            <TextField name="district" label="DISTRICT" required />
            <TextField name="territory" label="TERRITOIRE" required />
            <TextField name="sector" label="SECTEUR" required />
            <label className="space-y-2 text-sm text-slate-600">
              <span>ÉTAT-CIVIL</span>
              <select name="maritalStatus" required defaultValue="" className={inputClass}>
                <option value="" disabled>Sélectionner</option>
                <option value="CELIBATAIRE">Célibataire</option>
                <option value="MARIE">Marié(e)</option>
                <option value="DIVORCE">Divorcé(e)</option>
                <option value="VEUF">Veuf / veuve</option>
              </select>
            </label>
            <TextField name="fatherName" label="NOM DU PÈRE" required />
            <TextField name="motherName" label="NOM DE LA MÈRE" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="residentialAddress" label="ADRESSE RÉSIDENTIELLE 1" required />
            <TextField name="residentialAddress2" label="ADRESSE RÉSIDENTIELLE 2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="phone" label="NUMÉRO 1 DE CONTACT" type="tel" required />
            <TextField name="phone2" label="NUMÉRO 2 DE CONTACT" type="tel" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField name="studies" label="ÉTUDES FAITES" />
            <TextAreaField name="professionalExperiences" label="EXPÉRIENCES PROFESSIONNELLES" />
            <TextAreaField name="additionalTrainings" label="AUTRES FORMATIONS" />
            <TextAreaField name="spokenLanguages" label="LANGUES PARLÉES" />
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/employees" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={applications.length === 0}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enregistrer le dossier d’identité
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
