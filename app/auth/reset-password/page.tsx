import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SessionExpiry } from "@/components/auth/session-expiry";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/session/expired");
  }

  return (
    <>
      <SessionExpiry
        expiresInMs={Math.max(0, user.expiresAt.getTime() - Date.now())}
      />
      <AuthShell
        description="Choisissez un nouveau mot de passe pour votre compte."
        title="Nouveau mot de passe"
      >
        <AuthForm mode="reset-password" />
      </AuthShell>
    </>
  );
}
