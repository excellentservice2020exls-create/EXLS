import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      description="Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe."
      title="Mot de passe oublié"
    >
      <AuthForm mode="forgot-password" />
    </AuthShell>
  );
}
