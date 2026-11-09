// components/erp/role-dashboard.tsx

import Link from "next/link";
import { getAccessibleShifts, getAttendanceForShift, getDashboardStats, getSiteById } from "@/lib/erp-data";
import { getAppDataScope, hasPermission, requireRole, type ErpRole, type Permission } from "@/lib/erp-auth";
import { SessionExpiry } from "@/components/auth/session-expiry";

const ROLE_CONTENT: Record<ErpRole, { title: string; intro: string }> = {
  SUPER_ADMIN: { title: "Administration générale", intro: "Pilotage global des opérations EXLS." },
  ADMIN: { title: "Administration", intro: "Gestion des ressources et des opérations de l’organisation." },
  MANAGER: { title: "Espace manager", intro: "Vue d’ensemble des ressources et des opérations." },
  SUPERVISOR: { title: "Espace superviseur", intro: "Suivi des missions et présences de votre périmètre." },
  TEAM_LEADER: { title: "Espace chef d’équipe", intro: "Suivi des missions et présences de votre équipe." },
  AGENT: { title: "Espace agent", intro: "Vos missions et vos pointages." },
  USER: { title: "Mon espace", intro: "Accès à votre profil." },
};

const MODULES: { label: string; href: string; permission: Permission; description: string }[] = [
  { label: "Tableau de bord", href: "/dashboard", permission: "dashboard:read", description: "Indicateurs globaux et activité récente." },
  { label: "Équipe et agents", href: "/employees", permission: "employees:read", description: "Consulter les agents et les dossiers autorisés." },
  { label: "Clients", href: "/clients", permission: "clients:read", description: "Gérer les comptes clients et leurs sites." },
  { label: "Sites", href: "/sites", permission: "sites:read", description: "Consulter les sites opérationnels." },
  { label: "Missions", href: "/missions", permission: "missions:read", description: "Consulter les missions de votre périmètre." },
  { label: "Présences", href: "/attendance", permission: "attendance:read", description: "Enregistrer ou vérifier les pointages selon votre rôle." },
  { label: "Rapports", href: "/reports/day", permission: "reports:read", description: "Consulter les rapports du périmètre autorisé." },
  { label: "Paramètres", href: "/settings", permission: "settings:read", description: "Consulter les paramètres de l’application." },
  { label: "Mon profil", href: "/profile", permission: "profile:read:self", description: "Consulter vos informations personnelles." },
];

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}

export async function RoleDashboard({ role }: { role: ErpRole }) {
  const user = await requireRole([role]);
  const [shifts, scope] = await Promise.all([getAccessibleShifts(user), getAppDataScope(user)]);
  const content = ROLE_CONTENT[role];
  const upcoming = shifts.filter((shift) => new Date(shift.endTime) >= new Date()).slice(0, 5);
  const attendanceRows = await Promise.all(upcoming.map((shift) => getAttendanceForShift(shift.id)));
  const completedPointages = attendanceRows.flat().filter((record) => String(record.status) === "VERIFIED").length;
  const stats = role === "MANAGER" ? await getDashboardStats() : null;
  const modules = MODULES.filter((module) => hasPermission(user, module.permission));

  return (
    <div className="space-y-8">
      <SessionExpiry
        expiresAtMs={user.sessionExpiresAt.getTime()}
      />
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">EXLS · {role.replaceAll("_", " ")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{content.title}</h1>
        <p className="mt-2 text-slate-600">Bonjour {user.name}, {content.intro}</p>
      </header>

      <section aria-label="Indicateurs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats ? <>
          <Metric label="Agents" value={stats.agents} />
          <Metric label="Clients actifs" value={stats.clients} />
          <Metric label="Sites" value={stats.sites} />
          <Metric label="Missions en cours" value={stats.activeShifts} />
        </> : <>
          <Metric label={role === "AGENT" ? "Mes missions" : "Missions accessibles"} value={shifts.length} />
          {role !== "AGENT" && <Metric label={role === "SUPERVISOR" ? "Membres du périmètre" : "Membres de l’équipe"} value={Math.max(0, scope.userIds.size - (scope.userIds.has(user.id) ? 1 : 0))} />}
          <Metric label="Missions à venir" value={upcoming.length} />
          <Metric label="Pointages vérifiés récents" value={completedPointages} />
        </>}
      </section>

      <section>
        <div className="mb-4"><h2 className="text-xl font-semibold text-slate-900">Vos modules</h2><p className="mt-1 text-sm text-slate-500">Les accès disponibles dépendent de vos autorisations effectives.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => <Link key={module.href} href={module.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow">
            <h3 className="font-semibold text-slate-900">{module.label}</h3><p className="mt-2 text-sm text-slate-600">{module.description}</p><span className="mt-4 inline-block text-sm font-semibold text-emerald-700">Ouvrir →</span>
          </Link>)}
        </div>
      </section>

      {hasPermission(user, "missions:read") && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-900">Missions à venir</h2><p className="mt-1 text-sm text-slate-500">Données limitées à votre périmètre d’accès.</p></div><Link className="text-sm font-semibold text-emerald-700" href="/missions">Toutes les missions</Link></div>
        {upcoming.length ? <ul className="mt-4 divide-y divide-slate-100">{await Promise.all(upcoming.map(async (shift) => {
          const site = await getSiteById(shift.siteId);
          return <li key={shift.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-slate-900">{shift.title}</p><p className="text-sm text-slate-500">{site?.name ?? "Site non renseigné"} · {new Date(shift.startTime).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{String(shift.status)}</span></li>;
        }))}</ul> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aucune mission à venir dans votre périmètre.</p>}
      </section>}
    </div>
  );
}
