import Link from "next/link";
import { AgentTabs } from "@/components/erp/agent-tabs";
import {
  getAgentApplications,
  getAgentApplicationsWithoutIdentity,
} from "@/lib/erp-data";
import { requirePermission } from "@/lib/erp-auth";
import {
  createAgentApplication,
  createAgentIdentity,
  uploadAgentDocuments,
} from "../actions";

const errorMessages: Record<string, string> = {
  "application-invalid": "Vérifiez les champs obligatoires du formulaire de candidature.",
  "identity-invalid": "Vérifiez les champs obligatoires du formulaire d’identité.",
  "application-missing": "L’agent sélectionné n’existe plus. Choisissez un dossier valide.",
  "identity-exists": "Un dossier d’identité existe déjà pour cet agent.",
  "documents-invalid": "Sélectionnez un agent et fournissez tous les documents dans un format accepté (PDF, JPG ou PNG).",
  "document-too-large": "Chaque document doit peser au maximum 5 Mo.",
  "document-upload-failed": "Le téléversement a échoué. Les fichiers déjà transférés peuvent être remplacés en renvoyant le dossier.",
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
}: PageProps<"/admin/employees/new">) {
  await requirePermission("employees:create");
  const [{ error, status }, applications, documentApplications] = await Promise.all([
    searchParams,
    getAgentApplicationsWithoutIdentity(),
    getAgentApplications(),
  ]);
  const errorMessage =
    typeof error === "string" ? errorMessages[error] : undefined;
  const documentsUploaded = status === "documents-uploaded";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">AGENT</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Enregistrement d’un agent</h1>
      </header>

      <AgentTabs active="new" />

      <nav aria-label="Accès aux formulaires" className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-sm">
        <span className="font-semibold text-slate-500 mr-1">Formulaires :</span>
        <a
          href="#application-form"
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
        >
          1. Formulaire de candidature
        </a>
        <a
          href="#identity-form"
          className="rounded-xl bg-slate-100 px-3.5 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
        >
          2. Formulaire d’identité
        </a>
        <a
          href="#documents-form"
          className="rounded-xl bg-emerald-100 px-3.5 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-200 transition"
        >
          3. Dossier de l’agent (Documents d’embauche)
        </a>
      </nav>

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}
      {documentsUploaded && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Les documents de l’agent ont été téléversés.
        </p>
      )}

      <section id="application-form" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Formulaire 1</p>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-slate-900">
            Formulaire de candidature
          </h2>
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

      <section id="identity-form" className="space-y-4 pt-6">
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Formulaire 2</p>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-slate-900">
            Formulaire d’identité
          </h2>
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
            <Link href="/admin/employees" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
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

      <section id="documents-form" className="space-y-4 pt-6">
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Formulaire 3</p>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-slate-900">
            DOSSIER DE L’AGENT
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Ce formulaire sert de porte d’entrée des documents que l’agent doit fournir lors de son embauche :
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
          <p className="text-sm font-semibold text-emerald-950">
            « Veuillez adjoindre les photocopies de documents ci-après : »
          </p>
          <ul className="mt-2.5 grid gap-1.5 pl-5 text-sm text-emerald-900 list-disc">
            <li>Curriculum vitae actualisé</li>
            <li>Carte d’identité valide ou passeport en cours ou PV de la police</li>
            <li>Photos passeport (deux)</li>
            <li>Diplôme d’état ou document similaire ou équivalent</li>
            <li>Attestation de bonne vie et mœurs</li>
          </ul>
        </div>
        <form
          action={uploadAgentDocuments}
          encType="multipart/form-data"
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block space-y-2 text-sm text-slate-600">
            <span>AGENT CONCERNÉ</span>
            <select
              name="agentApplicationId"
              required
              defaultValue=""
              disabled={documentApplications.length === 0}
              className={inputClass}
            >
              <option value="" disabled>Sélectionner un agent</option>
              {documentApplications.map((application) => (
                <option key={String(application.id)} value={String(application.id)}>
                  {application.lastName} {application.postName} {application.firstName} — {application.phone}
                </option>
              ))}
            </select>
            {documentApplications.length === 0 && (
              <span className="block text-amber-700">
                Enregistrez d’abord une candidature pour pouvoir joindre ses documents.
              </span>
            )}
          </label>

          <p className="text-sm text-slate-600">
            Formats acceptés : PDF, JPG ou PNG. Taille maximale : 5 Mo par fichier.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">1. CURRICULUM VITAE ACTUALISÉ</span>
              <input
                name="curriculumVitae"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                required
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">2. CARTE D’IDENTITÉ VALIDE OU PASSEPORT EN COURS OU PV DE LA POLICE</span>
              <select
                name="identityDocumentType"
                required
                defaultValue="identity-card"
                className={inputClass}
              >
                <option value="identity-card">Carte d’identité valide</option>
                <option value="passport">Passeport en cours de validité</option>
                <option value="police-report">PV de la police (procès-verbal)</option>
              </select>
              <input
                name="identityDocument"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                required
                aria-label="Photocopie de la pièce d’identité choisie"
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">3. PHOTOS PASSEPORT (DEUX) — PREMIÈRE PHOTO</span>
              <input
                name="passportPhoto1"
                type="file"
                accept="image/jpeg,image/png"
                required
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">3. PHOTOS PASSEPORT (DEUX) — DEUXIÈME PHOTO</span>
              <input
                name="passportPhoto2"
                type="file"
                accept="image/jpeg,image/png"
                required
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">4. DIPLÔME D’ÉTAT OU DOCUMENT SIMILAIRE OU ÉQUIVALENT</span>
              <input
                name="diploma"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                required
                className={inputClass}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">5. ATTESTATION DE BONNE VIE ET MŒURS</span>
              <input
                name="goodConductCertificate"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                required
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin/employees"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={documentApplications.length === 0}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Enregistrer le dossier de l’agent
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
