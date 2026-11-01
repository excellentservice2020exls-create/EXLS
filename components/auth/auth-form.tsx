"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buttonClassName,
  FormMessage,
  inputClassName,
} from "./auth-shell";
import { PasswordInput } from "./password-input";

type AuthMode = "sign-in" | "forgot-password" | "reset-password";

function getCallbackUrl(next: string) {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}

export function AuthForm({
  mode,
  initialMessage,
}: {
  mode: AuthMode;
  initialMessage?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(initialMessage ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const needsPassword = mode !== "forgot-password";
  const needsEmail = mode !== "reset-password";
  const needsConfirmation = mode === "reset-password";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (needsConfirmation && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (needsPassword && password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();

      if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getCallbackUrl("/auth/reset-password"),
        });
        if (resetError) throw resetError;

        setMessage(
          "Si un compte correspond à cette adresse, un lien de réinitialisation vient d'être envoyé.",
        );
        return;
      }

      if (mode === "reset-password") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;

        router.replace("/account?password=updated");
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;

      router.replace(
        assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2"
          ? "/auth/mfa"
          : "/attendance",
      );
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {message && <FormMessage>{message}</FormMessage>}
      {error && (
        <div className="mb-4">
          <FormMessage error>{error}</FormMessage>
        </div>
      )}
      <form className="space-y-5" onSubmit={onSubmit}>
        {needsEmail && (
          <label className="block text-sm font-medium text-slate-200">
            Adresse e-mail
            <input
              autoComplete="email"
              className={inputClassName}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
        )}
        {needsPassword && (
          <label className="block text-sm font-medium text-slate-200">
            {mode === "reset-password" ? "Nouveau mot de passe" : "Mot de passe"}
            <PasswordInput
              autoComplete={
                mode === "sign-in"
                  ? "current-password"
                  : mode === "reset-password"
                    ? "new-password"
                    : "new-password"
              }
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              value={password}
            />
          </label>
        )}
        {needsConfirmation && (
          <label className="block text-sm font-medium text-slate-200">
            Confirmer le mot de passe
            <PasswordInput
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              value={confirmPassword}
            />
          </label>
        )}
        <button className={buttonClassName} disabled={pending} type="submit">
          {pending
            ? "Veuillez patienter…"
            : mode === "sign-in"
              ? "Se connecter"
              : mode === "forgot-password"
                ? "Envoyer le lien"
                : "Enregistrer le mot de passe"}
        </button>
      </form>

      <nav aria-label="Liens d’authentification" className="mt-6 flex flex-col gap-3 text-sm">
        {mode === "sign-in" && (
          <>
            <Link className="text-cyan-300 hover:text-cyan-200" href="/auth/forgot-password">
              Mot de passe oublié ?
            </Link>
          </>
        )}
        {(mode === "forgot-password" || mode === "reset-password") && (
          <Link className="text-cyan-300 hover:text-cyan-200" href="/auth/sign-in">
            Retour à la connexion
          </Link>
        )}
      </nav>
    </>
  );
}
