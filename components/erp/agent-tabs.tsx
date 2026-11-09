// components/erp/agent-tabs.tsx

import Link from "next/link";

type AgentTab = "active" | "all" | "new" | "search" | "inactive";

const tabs: { id: AgentTab; label: string; href: string }[] = [
  { id: "active", label: "AGENT ACTIF", href: "/employees?tab=active" },
  { id: "all", label: "LISTE AGENT", href: "/employees?tab=all" },
  { id: "new", label: "NOUVEAU AGENT", href: "/employees/new" },
  { id: "search", label: "RECHERCHE AGENT", href: "/employees?tab=search" },
  { id: "inactive", label: "AGENT NON-ACTIF", href: "/employees?tab=inactive" },
];

export function AgentTabs({ active }: { active: AgentTab }) {
  return (
    <nav
      aria-label="Navigation des agents"
      className="flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={active === tab.id ? "page" : undefined}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold ${
            active === tab.id
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
