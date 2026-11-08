// app/(app)/profile/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/erp-auth";
import { db } from "@/prisma/db";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super_Administrateur",
  ADMIN: "Administrateur",
  MANAGER: "Responsable",
  SUPERVISOR: "Superviseur",
  TEAM_LEADER: "Chef d'équipe",
  AGENT: "Agent",
};

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 wrap-break-words font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ProfilePage({
  searchParams,
}: PageProps<"/profile">) {
  const appUser = await requirePermission("profile:read:self");
  const { error, status } = await searchParams;
  const profile = await db.orm.public.User
    .where({ id: appUser.id })
    .select(
      "firstName",
      "lastName",
      "postName",
      "residentialAddress",
      "residentialAddress2",
      "phone",
      "phone2",
      "birthPlace",
      "birthDate",
      "studies",
      "educationLevel",
      "matricule",
      "cnapsNumber",
      "cnapsExpiration",
      "createdAt",
    )
    .first();

  if (!profile) {
    notFound();
  }

  const fullName = [profile.lastName, profile.postName, profile.firstName]
    .filter(Boolean)
    .join(" ");
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
  const role = String(appUser.role);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
          Mon espace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Mon profil</h1>
        <p className="mt-2 text-slate-600">
          Consultez et mettez à jour vos informations personnelles et professionnelles.
        </p>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800"
          >
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {roleLabels[role] ?? role}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Niveau d&apos;accès {appUser.level} ·{" "}
              {appUser.roles.map((assignedRole) => roleLabels[assignedRole] ?? assignedRole).join(", ")}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            String(appUser.status) === "ACTIVE"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {String(appUser.status) === "ACTIVE" ? "Compte actif" : "Compte inactif"}
        </span>
      </section>

      {status === "updated" && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Vos informations personnelles ont été mises à jour.
        </p>
      )}
      {error === "invalid" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Vérifiez les champs obligatoires, la date de naissance et la longueur des informations saisies.
        </p>
      )}

      <section aria-labelledby="contact-heading" className="space-y-4">
        <div>
          <h2 id="contact-heading" className="text-lg font-semibold text-slate-900">
            Identité et coordonnées
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Ces informations sont enregistrées sur votre profil personnel.
          </p>
        </div>
        <form action={updateProfile} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ProfileDetail label="Adresse e-mail" value={appUser.email} />

          <fieldset className="space-y-4">
            <legend className="font-semibold text-slate-800">Identité complète</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Nom</span>
                <input name="lastName" required maxLength={100} defaultValue={profile.lastName} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Postnom</span>
                <input name="postName" maxLength={100} defaultValue={profile.postName ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Prénom</span>
                <input name="firstName" required maxLength={100} defaultValue={profile.firstName} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-semibold text-slate-800">Adresses résidentielles</legend>
            <label className="block space-y-2 text-sm text-slate-600">
              <span>Adresse résidentielle 1</span>
              <textarea name="residentialAddress" maxLength={1000} defaultValue={profile.residentialAddress ?? ""} className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="block space-y-2 text-sm text-slate-600">
              <span>Adresse résidentielle 2</span>
              <textarea name="residentialAddress2" maxLength={1000} defaultValue={profile.residentialAddress2 ?? ""} className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-semibold text-slate-800">Téléphones de contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Téléphone 1</span>
                <input name="phone" type="tel" maxLength={40} defaultValue={profile.phone ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Téléphone 2</span>
                <input name="phone2" type="tel" maxLength={40} defaultValue={profile.phone2 ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-semibold text-slate-800">Naissance et études</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Lieu de naissance</span>
                <input name="birthPlace" maxLength={200} defaultValue={profile.birthPlace ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span>Date de naissance</span>
                <input name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={profile.birthDate?.toISOString().slice(0, 10) ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
            </div>
            <label className="block space-y-2 text-sm text-slate-600">
              <span>Études faites</span>
              <textarea name="studies" maxLength={2000} defaultValue={profile.studies ?? ""} className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="block space-y-2 text-sm text-slate-600">
              <span>Niveau d&apos;études</span>
              <input name="educationLevel" maxLength={150} defaultValue={profile.educationLevel ?? ""} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
          </fieldset>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
              Enregistrer mes informations
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="work-heading" className="space-y-4">
        <h2 id="work-heading" className="text-lg font-semibold text-slate-900">
          Informations professionnelles
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ProfileDetail label="Matricule" value={profile.matricule} />
          <ProfileDetail label="Fonction" value={roleLabels[role] ?? role} />
          <ProfileDetail
            label="Numéro de carte professionnelle (CNAPS)"
            value={profile.cnapsNumber || "Non renseigné"}
          />
          <ProfileDetail
            label="Expiration de la carte CNAPS"
            value={
              profile.cnapsExpiration
                ? new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "long",
                    timeZone: "UTC",
                  }).format(profile.cnapsExpiration)
                : "Non renseignée"
            }
          />
          <ProfileDetail
            label="Membre depuis"
            value={new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "long",
              timeZone: "UTC",
            }).format(profile.createdAt)}
          />
        </dl>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">Sécurité du compte</h2>
          <p className="mt-1 text-sm text-slate-600">
            Gérez votre mot de passe et la double authentification.
          </p>
        </div>
        <Link
          href="/account"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Gérer mon compte
        </Link>
      </section>
    </div>
  );
}
