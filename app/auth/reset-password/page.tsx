import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <AuthShell
      description="Choisissez un nouveau mot de passe pour votre compte."
      title="Nouveau mot de passe"
    >
      <AuthForm mode="reset-password" />
    </AuthShell>
  );
}
