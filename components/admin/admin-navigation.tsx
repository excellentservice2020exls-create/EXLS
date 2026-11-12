"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavigationProps = {
  modules: { title: string; href: string }[];
};

export function AdminNavigation({ modules }: AdminNavigationProps) {
  const pathname = usePathname();

  function linkClassName(href: string) {
    const isActive =
      href === "/admin"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);

    return `rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "text-emerald-400"
        : "text-slate-300 hover:text-white"
    } hover:bg-slate-800`;
  }

  return (
    <nav className="flex flex-wrap gap-2 px-4 py-4 md:flex-1 md:flex-col md:gap-1 md:py-6">
      <Link href="/admin" className={linkClassName("/admin")}>
        Accueil admin
      </Link>

      {modules.map(({ title, href }) => (
        <Link key={href} href={href} className={linkClassName(href)}>
          {title}
        </Link>
      ))}
    </nav>
  );
}
