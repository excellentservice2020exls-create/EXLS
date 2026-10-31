import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      description="Inscrivez-vous avec votre adresse e-mail et un mot de passe."
      title="Créer un compte"
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
