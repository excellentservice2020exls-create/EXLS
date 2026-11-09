// components/erp/client-tabs.tsx

import Link from "next/link";

type ClientTabsProps = {
  active: "list" | "new" | "search" | "archives";
  canArchive: boolean;
  canCreate: boolean;
  canRead: boolean;
};

export function ClientTabs({
  active,
  canArchive,
  canCreate,
  canRead,
}: ClientTabsProps) {
  const linkClass = (isActive: boolean) =>
    `-mb-px border-b-2 px-1 pb-3 text-sm font-medium ${
      isActive
        ? "border-emerald-600 text-emerald-700"
        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
    }`;

  return (
    <nav aria-label="Navigation clients" className="flex gap-6 border-b border-slate-200">
      {canRead && (
        <Link
          href="/clients"
          aria-current={active === "list" ? "page" : undefined}
          className={linkClass(active === "list")}
        >
          Liste des clients
        </Link>
      )}
      {canRead && (
        <Link
          href="/clients/search"
          aria-current={active === "search" ? "page" : undefined}
          className={linkClass(active === "search")}
        >
          Recherche Client
        </Link>
      )}
      {canArchive && (
        <Link
          href="/clients/archives"
          aria-current={active === "archives" ? "page" : undefined}
          className={linkClass(active === "archives")}
        >
          Clients archivés
        </Link>
      )}
      {canCreate && (
        <Link
          href="/clients/new"
          aria-current={active === "new" ? "page" : undefined}
          className={linkClass(active === "new")}
        >
          Nouveau client
        </Link>
      )}
    </nav>
  );
}
