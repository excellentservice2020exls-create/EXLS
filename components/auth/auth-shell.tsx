import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl shadow-black/30 sm:p-9">
        <Link href="/auth/sign-in" className="text-sm font-bold tracking-[0.2em] text-cyan-400">
          EXLS
        </Link>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}

export const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

export const buttonClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-60";

export function FormMessage({
  error,
  children,
}: {
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-lg px-3.5 py-3 text-sm leading-5 ${
        error
          ? "border border-rose-900 bg-rose-950/60 text-rose-200"
          : "border border-emerald-900 bg-emerald-950/50 text-emerald-200"
      }`}
    >
      {children}
    </p>
  );
}
