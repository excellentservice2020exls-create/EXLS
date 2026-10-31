"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buttonClassName,
  FormMessage,
  inputClassName,
} from "./auth-shell";
import { SignOutButton } from "./sign-out-button";

type TotpFactor = {
  id: string;
  friendly_name?: string;
};

export function MfaChallenge() {
  const router = useRouter();
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFactors() {
      const { data, error: factorsError } = await createClient().auth.mfa.listFactors();
      if (!active) return;

      if (factorsError) {
        setError(factorsError.message);
      } else {
        const verifiedFactors = data.totp
          .filter((factor) => factor.status === "verified")
          .map(({ id, friendly_name }) => ({ id, friendly_name }));
        setFactors(verifiedFactors);
        setFactorId(verifiedFactors[0]?.id ?? "");
      }
      setLoading(false);
    }

    void loadFactors().catch((caughtError: unknown) => {
      if (active) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Impossible de charger le facteur.",
        );
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.replace(/\s/g, ""),
      });
      if (verifyError) throw verifyError;

      router.replace("/account");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Code de vérification invalide.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl shadow-black/30 sm:p-9">
        <p className="text-sm font-bold tracking-[0.2em] text-cyan-400">EXLS</p>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">Vérification en deux étapes</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Saisissez le code à 6 chiffres de votre application d’authentification.
        </p>

        {error && (
          <div className="mt-5">
            <FormMessage error>{error}</FormMessage>
          </div>
        )}

        {loading ? (
          <p className="mt-7 text-sm text-slate-400">Chargement…</p>
        ) : factors.length === 0 ? (
          <div className="mt-7 space-y-4">
            <FormMessage error>
              Aucun facteur TOTP vérifié n’est disponible pour ce compte. Connectez-vous de nouveau
              ou contactez votre administrateur.
            </FormMessage>
            <Link className="block text-sm text-cyan-300 hover:text-cyan-200" href="/auth/sign-in">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            {factors.length > 1 && (
              <label className="block text-sm font-medium text-slate-200">
                Application d’authentification
                <select
                  className={inputClassName}
                  onChange={(event) => setFactorId(event.target.value)}
                  value={factorId}
                >
                  {factors.map((factor) => (
                    <option key={factor.id} value={factor.id}>
                      {factor.friendly_name || "Application d’authentification"}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm font-medium text-slate-200">
              Code de vérification
              <input
                autoComplete="one-time-code"
                autoFocus
                className={`${inputClassName} text-center font-mono text-lg tracking-[0.4em]`}
                inputMode="numeric"
                maxLength={8}
                onChange={(event) => setCode(event.target.value)}
                pattern="[0-9 ]{6,8}"
                required
                value={code}
              />
            </label>
            <button className={buttonClassName} disabled={pending || !factorId} type="submit">
              {pending ? "Vérification…" : "Vérifier et continuer"}
            </button>
          </form>
        )}
        <div className="mt-7 border-t border-slate-800 pt-5">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
