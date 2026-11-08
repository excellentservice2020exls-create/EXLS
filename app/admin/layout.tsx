import Link from "next/link";
import { requireRole } from "@/lib/erp-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="border-b border-slate-800 bg-slate-950 text-slate-50 md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col md:border-b-0 md:border-r">
        <div className="border-b border-slate-800 px-6 py-5">
          <Link href="/admin" className="block">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
              EXLS
            </p>
            <span className="mt-2 block text-2xl font-semibold">
              Administration
            </span>
          </Link>
        </div>

        <nav className="flex flex-wrap gap-2 px-4 py-4 md:flex-1 md:flex-col md:gap-1 md:py-6">
          <Link
            href="/admin"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          >
            Accueil admin
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            ERP
          </Link>
        </nav>

        <div className="hidden border-t border-slate-800 px-4 py-4 text-sm text-slate-300 md:block">
          <p className="font-medium text-white">{user.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user.role}</p>
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-8 md:ml-72">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
