import Link from "next/link";
import { requireRole } from "@/lib/erp-auth";
import { SessionExpiry } from "@/components/auth/session-expiry";
import { adminModuleTitle } from "@/components/admin/admin-module";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <SessionExpiry
        expiresAtMs={user.sessionExpiresAt.getTime()}
      />
      <aside className="border-b border-slate-800 bg-slate-950 text-slate-50 md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col md:border-b-0 md:border-r">
        <div className="border-b border-slate-800 px-6 py-5">
          <Link href="/" className="block">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 hover:font-bold">
              EXLS
            </p>
          </Link>
          <Link href="/admin" className="block">
            <span className="mt-2 block text-2xl font-semibold text-emerald-400 hover:font-bold">
              Administration
            </span>
          </Link>
        </div>

        <AdminNavigation
          modules={adminModuleTitle().filter(
            ({ title }) =>
              title !== "Sécurité" || user.roles.includes("SUPER_ADMIN"),
          )}
        />

        <div className="hidden border-t border-slate-800 px-4 py-4 text-sm text-slate-300 md:block">
          <p className="font-medium text-white">{user.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
          <p className="mt-1 text-xs text-slate-400">{user.role}</p>
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-8 md:ml-72">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
