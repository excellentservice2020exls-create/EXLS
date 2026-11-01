// app/(app)/profile/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/lib/erp-auth";
import { db } from "@/prisma/db";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  DIRECTOR: "Direction",
  MANAGER: "Responsable",
  SUPERVISOR: "Superviseur",
  AGENT: "Agent",
};

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 break-words font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const appUser = await requireAppUser();
  const profile = await db.orm.public.User
    .where({ id: appUser.id })
    .select(
      "firstName",
      "lastName",
      "phone",
      "matricule",
      "cnapsNumber",
      "cnapsExpiration",
      "createdAt",
    )
    .first();

  if (!profile) {
    notFound();
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
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
          Consultez vos informations personnelles et professionnelles.
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

      <section aria-labelledby="contact-heading" className="space-y-4">
        <h2 id="contact-heading" className="text-lg font-semibold text-slate-900">
          Coordonnées
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ProfileDetail label="Adresse e-mail" value={appUser.email} />
          <ProfileDetail label="Téléphone" value={profile.phone || "Non renseigné"} />
        </dl>
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
