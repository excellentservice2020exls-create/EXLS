// components/admin/admin-module.ts

import { ClipboardCheck, ContactRound, LayoutDashboard, UsersRound, BriefcaseBusiness, UserRound, FileText, ShieldCheck, Settings, Building2 } from "lucide-react";

export const modules = [
  {
    title: "Tableau de bord",
    description: "Retrouver les indicateurs et l’activité de l’ERP.",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Présences",
    description: "Consulter les pointages et les présences.",
    href: "/admin/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Agents",
    description: "Consulter les agents et leurs dossiers.",
    href: "/admin/employees",
    icon: UsersRound,
  },
  {
    title: "Sites",
    description: "Consulter les sites et leurs informations.",
    href: "/admin/sites",
    icon: Building2,
  },
  {
    title: "Clients",
    description: "Accéder aux dossiers et informations des clients.",
    href: "/admin/clients",
    icon: ContactRound,
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
];

export function adminModuleTitle() {
  return modules.map(({ title, href }) => ({ title, href }));
}
