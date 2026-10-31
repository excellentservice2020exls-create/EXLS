"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buttonClassName,
  FormMessage,
  inputClassName,
} from "./auth-shell";

export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setPending(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;

      setPassword("");
      setConfirmation("");
      setMessage("Votre mot de passe a été modifié.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de modifier le mot de passe.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="font-semibold">Modifier le mot de passe</h2>
      <p className="mt-1 text-sm leading-6 text-slate-400">
        Choisissez un mot de passe d’au moins 8 caractères.
      </p>
      {error && (
        <div className="mt-4">
          <FormMessage error>{error}</FormMessage>
        </div>
      )}
      {message && (
        <div className="mt-4">
          <FormMessage>{message}</FormMessage>
        </div>
      )}
      <form className="mt-4 max-w-md space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-200">
          Nouveau mot de passe
          <input
            autoComplete="new-password"
            className={inputClassName}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Confirmer le nouveau mot de passe
          <input
            autoComplete="new-password"
            className={inputClassName}
            minLength={8}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            type="password"
            value={confirmation}
          />
        </label>
        <button className={`${buttonClassName} sm:w-auto`} disabled={pending} type="submit">
          {pending ? "Mise à jour…" : "Modifier le mot de passe"}
        </button>
      </form>
    </section>
  );
}
