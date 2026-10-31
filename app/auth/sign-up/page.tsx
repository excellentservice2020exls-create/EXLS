import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/auth-shell";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthShell
      description="La création de comptes est réservée à l’administration EXLS."
      title="Inscription désactivée"
    >
      <FormMessage>
        Demandez à un responsable EXLS de créer votre profil. Vous recevrez ensuite un lien sécurisé pour activer votre compte.
      </FormMessage>
      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
        href="/auth/sign-in"
      >
        Retour à la connexion
      </Link>
    </AuthShell>
  );
}
