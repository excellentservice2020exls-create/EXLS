import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  ContactRound,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  BriefcaseBusiness,
} from "lucide-react";
import { requireAppUser } from "@/lib/erp-auth";

const modules = [
  {
    title: "Présences",
    description: "Consulter les pointages et les présences.",
    href: "/admin/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Clients",
    description: "Accéder aux dossiers et informations des clients.",
    href: "/admin/clients",
    icon: ContactRound,
  },
  {
    title: "Tableau de bord",
    description: "Retrouver les indicateurs et l’activité de l’ERP.",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agents",
    description: "Consulter les agents et leurs dossiers.",
    href: "/admin/employees",
    icon: UsersRound,
  },
  {
    title: "Missions",
    description: "Consulter les missions et les affectations.",
    href: "/admin/missions",
    icon: BriefcaseBusiness,
  },
  {
    title: "Profil",
    description: "Voir et mettre à jour votre profil.",
    href: "/admin/profile",
    icon: UserRound,
  },
  {
    title: "Rapports",
    description: "Consulter les rapports d’activité et de présence.",
    href: "/admin/reports/day",
    icon: FileText,
  },
  {
    title: "Sécurité",
    description: "Gérer la sécurité du compte, le MFA et le mot de passe.",
    href: "/admin/security",
    icon: ShieldCheck,
  },
  {
    title: "Paramètres",
    description: "Consulter les référentiels et paramètres EXLS.",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Sites",
    description: "Consulter les sites et leurs informations.",
    href: "/admin/sites",
    icon: Building2,
  },
];

export default async function AdminPage() {
  const user = await requireAppUser();
  const visibleModules = modules.filter(
    (module) => module.title !== "Sécurité" || user.roles.includes("SUPER_ADMIN"),
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
          EXLS · Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Espace d’administration
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Accédez aux modules de gestion de la plateforme.
        </p>
      </header>

      <section
        aria-label="Modules d’administration"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {visibleModules.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
              <Icon aria-hidden="true" size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {description}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-emerald-700">
              Ouvrir le module <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
