import { MfaSettings } from "@/components/auth/mfa-settings";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { getAuthenticatorAssuranceLevel } from "@/lib/supabase/assurance";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requestAccountAccess } from "./actions";
import { SessionExpiry } from "@/components/auth/session-expiry";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: PageProps<"/account">) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/session/expired");
  }

  const supabase = await createClient();
  const assurance = await getAuthenticatorAssuranceLevel(supabase);
  if (!assurance) {
    redirect("/auth/sign-in");
  }
  if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
    redirect("/auth/mfa");
  }

  const { password, erpAccess } = await searchParams;
  const email = user.email?.trim();
  const matchingProfiles = email
    ? await db.orm.public.User
        .where((profile) => profile.email.ilike(email.replace(/[\\%_]/g, "\\$&")))
        .select("id", "role", "status")
        .limit(2)
        .all()
    : [];
  const profile = matchingProfiles.length === 1 ? matchingProfiles[0] : null;
  const isSuperAdmin = String(profile?.role) === "SUPER_ADMIN";
  const isActiveProfile = String(profile?.status) === "ACTIVE";
  const accessRequest =
    profile && user.sessionId && !isSuperAdmin
      ? await db.orm.public.SecurityAccessRequest
          .where({ userId: profile.id, sessionId: user.sessionId })
          .select("status")
          .first()
      : null;
  const erpAccessMessage: Record<string, string> = {
    "not-provisioned":
      "Votre compte de connexion est prêt, mais aucun profil d’agent EXLS ne correspond à cette adresse. Vérifiez que vous utilisez l’adresse fournie à votre responsable, qui pourra créer votre profil.",
    inactive:
      "Votre profil EXLS existe mais n’est pas actif. Contactez un administrateur EXLS pour vérifier votre accès.",
    ambiguous:
      "Plusieurs profils EXLS correspondent à cette adresse. Contactez un administrateur afin de corriger les profils avant de réessayer.",
    "role-required":
      "Votre profil EXLS n’a pas de rôle opérationnel. Contactez un administrateur EXLS pour vérifier votre accès.",
    "approval-required":
      "L’accès à l’ERP de cette session nécessite l’approbation explicite d’un SUPER_ADMIN.",
    "approval-pending":
      "Votre demande d’accès est en attente de la décision d’un SUPER_ADMIN.",
    "approval-rejected":
      "Votre demande d’accès a été refusée. Déconnectez-vous puis reconnectez-vous pour soumettre une nouvelle demande.",
    "approval-approved":
      "L’accès à cette session est approuvé. Vous pouvez ouvrir l’ERP.",
    "session-required":
      "La session de connexion ne permet pas de vérifier une demande d’accès. Déconnectez-vous puis reconnectez-vous.",
  };
  const accessMessage =
    typeof erpAccess === "string" ? erpAccessMessage[erpAccess] : undefined;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
      <SessionExpiry expiresAt={user.expiresAt.toISOString()} />
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-800 pb-6">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-cyan-400">EXLS</p>
            <h1 className="mt-3 text-2xl font-semibold">Votre compte</h1>
          </div>
          <SignOutButton />
        </header>

        <section className="mt-7 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-semibold">Adresse e-mail</h2>
          <p className="mt-2 text-sm text-slate-300">{user.email ?? "Adresse non disponible"}</p>
        </section>

        {accessMessage && (
          <p
            className="mt-5 rounded-lg border border-amber-800 bg-amber-950/50 px-3.5 py-3 text-sm text-amber-200"
            role="status"
          >
            {accessMessage}
          </p>
        )}

        {password === "updated" && (
          <p
            className="mt-5 rounded-lg border border-emerald-900 bg-emerald-950/50 px-3.5 py-3 text-sm text-emerald-200"
            role="status"
          >
            Votre mot de passe a été modifié.
          </p>
        )}

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-semibold">Accès à l’ERP</h2>
          {isSuperAdmin && isActiveProfile ? (
            <div className="mt-3">
              <p className="text-sm text-slate-300">
                Votre compte SUPER_ADMIN est exempté de validation d’accès.
              </p>
              <Link
                href="/security"
                className="mt-4 inline-flex rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Gérer les demandes d’accès
              </Link>
            </div>
          ) : !profile ? (
            <p className="mt-3 text-sm text-slate-300">
              Aucun profil EXLS unique ne correspond à cette adresse. Contactez un administrateur.
            </p>
          ) : !isActiveProfile ? (
            <p className="mt-3 text-sm text-slate-300">
              Votre profil EXLS n’est pas actif. Contactez un SUPER_ADMIN.
            </p>
          ) : accessRequest?.status === "APPROVED" ? (
            <div className="mt-3">
              <p className="text-sm text-emerald-300">
                Votre session a été approuvée par un SUPER_ADMIN.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Accéder à l’ERP
              </Link>
            </div>
          ) : accessRequest?.status === "PENDING" ? (
            <p className="mt-3 text-sm text-amber-200">
              Votre demande est en attente. L’accès à l’ERP restera bloqué jusqu’à décision.
            </p>
          ) : accessRequest?.status === "REJECTED" ? (
            <p className="mt-3 text-sm text-amber-200">
              Votre demande a été refusée. Déconnectez-vous puis reconnectez-vous pour déposer une nouvelle demande.
            </p>
          ) : !user.sessionId ? (
            <p className="mt-3 text-sm text-amber-200">
              Déconnectez-vous puis reconnectez-vous pour créer une demande liée à votre session.
            </p>
          ) : (
            <form action={requestAccountAccess} className="mt-3">
              <p className="text-sm text-slate-300">
                Chaque session doit être approuvée explicitement par un SUPER_ADMIN avant l’accès aux modules EXLS.
              </p>
              <button
                type="submit"
                className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Demander l’accès
              </button>
            </form>
          )}
        </section>

        <div className="mt-6">
          <MfaSettings />
        </div>

        <PasswordChangeForm />
        <p className="mt-5 text-sm text-slate-400">
          Mot de passe oublié ?{" "}
          <Link
            className="font-medium text-cyan-300 hover:text-cyan-200"
            href="/auth/forgot-password"
          >
            Recevoir un lien de réinitialisation
          </Link>
        </p>
      </div>
    </main>
  );
}
