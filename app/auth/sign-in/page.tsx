import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

const messages: Record<string, string> = {
  confirmed: "Votre adresse e-mail est confirmée. Vous pouvez maintenant vous connecter.",
  callback: "Le lien n’a pas pu être vérifié ou a expiré. Demandez-en un nouveau.",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: PageProps<"/auth/sign-in">) {
  const { status } = await searchParams;
  const statusValue = Array.isArray(status) ? status[0] : status;

  return (
    <AuthShell
      description="Connectez-vous à votre compte EXLS."
      title="Connexion"
    >
      <AuthForm
        initialMessage={statusValue ? messages[statusValue] : undefined}
        mode="sign-in"
      />
    </AuthShell>
  );
}
