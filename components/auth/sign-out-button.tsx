"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signOut() {
    setError("");
    setPending(true);

    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) throw signOutError;

      router.replace("/auth/sign-in");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "La déconnexion a échoué.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-60"
        disabled={pending}
        onClick={signOut}
        type="button"
      >
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
