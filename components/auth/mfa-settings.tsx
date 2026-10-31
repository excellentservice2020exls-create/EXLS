"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buttonClassName,
  FormMessage,
  inputClassName,
} from "./auth-shell";

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function MfaSettings() {
  const [enrolled, setEnrolled] = useState(false);
  const [pendingFactorId, setPendingFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  async function loadFactors() {
    const { data, error: factorsError } = await createClient().auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const verified = data.totp.find((factor) => factor.status === "verified");
    const unverified = data.all.find(
      (factor) => factor.factor_type === "totp" && factor.status === "unverified",
    );
    setEnrolled(Boolean(verified));
    setPendingFactorId(unverified?.id ?? "");
  }

  useEffect(() => {
    let active = true;

    void createClient()
      .auth.mfa.listFactors()
      .then(({ data, error: factorsError }) => {
        if (!active) return;
        if (factorsError) {
          setError(factorsError.message);
          return;
        }
        setEnrolled(data.totp.some((factor) => factor.status === "verified"));
        setPendingFactorId(
          data.all.find(
            (factor) => factor.factor_type === "totp" && factor.status === "unverified",
          )?.id ?? "",
        );
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(
            caughtError instanceof Error ? caughtError.message : "Impossible de charger le facteur.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function startEnrollment() {
    setError("");
    setMessage("");
    setPending(true);

    try {
      const supabase = createClient();
      if (pendingFactorId) {
        const { error: removeError } = await supabase.auth.mfa.unenroll({
          factorId: pendingFactorId,
        });
        if (removeError) throw removeError;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "EXLS",
      });
      if (enrollError) throw enrollError;

      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setPendingFactorId(data.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Impossible de démarrer la configuration.",
      );
    } finally {
      setPending(false);
    }
  }

  async function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;

    setError("");
    setMessage("");
    setPending(true);

    try {
      const { error: verifyError } = await createClient().auth.mfa.challengeAndVerify({
        factorId: enrollment.factorId,
        code: code.replace(/\s/g, ""),
      });
      if (verifyError) throw verifyError;

      setEnrollment(null);
      setCode("");
      setMessage("La vérification en deux étapes est activée pour votre compte.");
      await loadFactors();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Code de vérification invalide.",
      );
    } finally {
      setPending(false);
    }
  }

  async function disableMfa() {
    if (!window.confirm("Désactiver la vérification en deux étapes pour ce compte ?")) return;

    setError("");
    setMessage("");
    setPending(true);

    try {
      const supabase = createClient();
      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance.currentLevel !== "aal2") {
        throw new Error("Vérifiez d’abord votre code TOTP avant de désactiver cette protection.");
      }

      const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const factor = data.totp.find((item) => item.status === "verified");
      if (!factor) {
        throw new Error("Aucun facteur TOTP actif n’a été trouvé.");
      }

      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });
      if (unenrollError) throw unenrollError;

      setEnrolled(false);
      setMessage("La vérification en deux étapes a été désactivée.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Impossible de désactiver le facteur.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-100">Vérification en deux étapes</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
            Utilisez une application d’authentification compatible TOTP. Le code sera demandé à
            chaque nouvelle connexion.
          </p>
        </div>
        {!loading && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              enrolled
                ? "bg-emerald-950 text-emerald-300"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {enrolled ? "Activée" : "Facultative"}
          </span>
        )}
      </div>

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

      {loading ? (
        <p className="mt-5 text-sm text-slate-400">Chargement…</p>
      ) : enrollment ? (
        <form className="mt-5 space-y-5" onSubmit={verifyEnrollment}>
          <ol className="list-inside list-decimal space-y-2 text-sm leading-6 text-slate-300">
            <li>Scannez ce QR code dans votre application d’authentification.</li>
            <li>Entrez le code à 6 chiffres affiché par cette application.</li>
          </ol>
          {/* Supabase returns this SVG as a data URL; it is not user-provided markup. */}
          <Image
            alt="QR code de configuration TOTP"
            className="h-48 w-48 rounded-lg bg-white p-2"
            height={192}
            unoptimized
            src={enrollment.qrCode}
            width={192}
          />
          <details className="text-sm text-slate-400">
            <summary className="cursor-pointer">Impossible de scanner ? Afficher la clé</summary>
            <code className="mt-2 block break-all rounded bg-slate-900 p-3 text-cyan-200">
              {enrollment.secret}
            </code>
          </details>
          <label className="block text-sm font-medium text-slate-200">
            Code de vérification
            <input
              autoComplete="one-time-code"
              className={`${inputClassName} max-w-xs font-mono tracking-[0.3em]`}
              inputMode="numeric"
              maxLength={8}
              onChange={(event) => setCode(event.target.value)}
              pattern="[0-9 ]{6,8}"
              required
              value={code}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60" disabled={pending} type="submit">
              {pending ? "Vérification…" : "Activer la vérification"}
            </button>
            <button
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              disabled={pending}
              onClick={() => setEnrollment(null)}
              type="button"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : enrolled ? (
        <button
          className="mt-5 rounded-lg border border-rose-900 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-950 disabled:opacity-60"
          disabled={pending}
          onClick={disableMfa}
          type="button"
        >
          {pending ? "Mise à jour…" : "Désactiver la vérification"}
        </button>
      ) : (
        <button
          className={buttonClassName + " mt-5 w-auto"}
          disabled={pending}
          onClick={startEnrollment}
          type="button"
        >
          {pending ? "Préparation…" : "Configurer une application"}
        </button>
      )}
    </section>
  );
}
