import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(8,145,178,0.2),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full border border-cyan-300/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border border-cyan-300/10"
      />

      <section className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-9 flex items-center justify-center px-8 py-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-2xl font-black tracking-tight text-cyan-300 shadow-lg shadow-cyan-950/40">
          EXLS
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.42em] text-cyan-300 sm:text-base">
          =
        </p>
        <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.06em] text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text sm:text-7xl md:text-8xl">
          Excellent
          <span className="mt-2 block">Service</span>
        </h1>
        <div className="mt-8 h-px w-20 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
          Bienvenue dans le portail de la société EXLS, en sigle.
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-10 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
        >
          Entrer dans le portail
          <span aria-hidden="true" className="text-xl">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
