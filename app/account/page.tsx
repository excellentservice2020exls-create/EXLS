import { MfaSettings } from "@/components/auth/mfa-settings";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: PageProps<"/account">) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const supabase = await createClient();
  const { data: assurance, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) {
    throw error;
  }
  if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
    redirect("/auth/mfa");
  }

  const { password, erpAccess } = await searchParams;
  const erpAccessMessage: Record<string, string> = {
    "not-provisioned":
      "Votre compte de connexion est prêt, mais aucun profil employé EXLS ne correspond à cette adresse. Vérifiez que vous utilisez l’adresse fournie à votre responsable, qui pourra créer votre profil.",
    inactive:
      "Votre profil EXLS existe mais n’est pas actif. Contactez un administrateur EXLS pour vérifier votre accès.",
    ambiguous:
      "Plusieurs profils EXLS correspondent à cette adresse. Contactez un administrateur afin de corriger les profils avant de réessayer.",
  };
  const accessMessage =
    typeof erpAccess === "string" ? erpAccessMessage[erpAccess] : undefined;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8">
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
