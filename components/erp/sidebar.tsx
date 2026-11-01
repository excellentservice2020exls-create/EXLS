// components/erp/sidebar.tsx

import Link from "next/link";
import type { Permission } from "@/lib/erp-auth";

export function Sidebar({
  role,
  roles,
  level,
  email,
  permissions,
}: {
  role: string;
  roles: readonly string[];
  level: number;
  email: string;
  permissions: readonly Permission[];
}) {
  const navigationItems: { href: string; label: string; permission: Permission }[] = [
    { href: "/dashboard", label: "Tableau de bord", permission: "dashboard:read" },
    { href: "/profile", label: "Mon profil", permission: "profile:read:self" },
    { href: "/employees", label: "Personnel", permission: "employees:read" },
    { href: "/clients", label: "Abonnés / Clients", permission: "clients:read" },
    { href: "/missions", label: "Missions", permission: "missions:read" },
    { href: "/attendance", label: "Présences", permission: "attendance:read" },
    { href: "/reports/day", label: "Rapports", permission: "reports:read" },
    { href: "/settings", label: "Paramètres", permission: "settings:read" },
  ];
  const items = navigationItems.filter((item) =>
    permissions.includes(item.permission),
  );

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-50">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">EXLS</p>
        <h1 className="mt-2 text-2xl font-semibold">ERP Gardiennage</h1>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-slate-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4 text-sm text-slate-300">
        <p className="font-medium text-white">{role}</p>
        <p className="mt-1 text-xs text-slate-400">
          Rôles : {roles.join(", ")} · Niveau {level}
        </p>
        <p className="mt-1">{email}</p>
      </div>
    </aside>
  );
}
