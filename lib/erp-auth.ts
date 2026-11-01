import "server-only";

import { notFound, redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export const ERP_ROLES = [
  "ADMIN",
  "DIRECTOR",
  "MANAGER",
  "SUPERVISOR",
  "AGENT",
] as const;

export type ErpRole = (typeof ERP_ROLES)[number];

export const ROLE_LEVELS: Readonly<Record<ErpRole, number>> = {
  ADMIN: 100,
  DIRECTOR: 80,
  MANAGER: 60,
  SUPERVISOR: 40,
  AGENT: 20,
};

export const MANAGEMENT_ROLES = ["ADMIN", "DIRECTOR", "MANAGER"] as const;
export const SUPERVISOR_ROLES = [...MANAGEMENT_ROLES, "SUPERVISOR"] as const;

export const PERMISSIONS = [
  "dashboard:read",
  "profile:read:self",
  "employees:read",
  "employees:create",
  "clients:read",
  "clients:create",
  "missions:read",
  "missions:create",
  "attendance:read",
  "attendance:create:self",
  "attendance:create:team",
  "attendance:verify",
  "reports:read",
  "settings:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Readonly<Record<ErpRole, readonly Permission[]>> = {
  ADMIN: PERMISSIONS,
  DIRECTOR: PERMISSIONS,
  MANAGER: PERMISSIONS,
  SUPERVISOR: [
    "profile:read:self",
    "missions:read",
    "attendance:read",
    "attendance:create:team",
    "attendance:verify",
    "reports:read",
  ],
  AGENT: ["profile:read:self", "attendance:read", "attendance:create:self"],
};

export type AppUser = {
  id: number;
  email: string;
  role: ErpRole;
  status: string;
  roles: ErpRole[];
  level: number;
  permissions: Permission[];
};

export type AppDataScope = {
  organizationWide: boolean;
  userIds: ReadonlySet<number>;
  siteIds: ReadonlySet<number>;
};

export function isErpRole(value: string): value is ErpRole {
  return (ERP_ROLES as readonly string[]).includes(value);
}

export async function getEffectiveRoles(userId: number, primaryRole: string) {
  if (!isErpRole(primaryRole)) {
    throw new Error(`The EXLS user ${userId} has an unsupported primary role.`);
  }

  const assignedRoles = await db.orm.public.RoleAssignment
    .where({ userId })
    .select("role")
    .all();
  const assignedRoleValues = assignedRoles.map((assignment) => String(assignment.role));
  if (!assignedRoleValues.every(isErpRole)) {
    throw new Error(`The EXLS user ${userId} has an unsupported role assignment.`);
  }
  if (primaryRole !== "ADMIN" && assignedRoleValues.includes("ADMIN")) {
    throw new Error(`The EXLS user ${userId} has an invalid ADMIN role assignment.`);
  }

  return [...new Set<ErpRole>([primaryRole, ...assignedRoleValues])];
}

export function hasRole(user: AppUser, roles: readonly string[]) {
  return user.roles.some((role) => roles.includes(role));
}

export function hasPermission(user: AppUser, permission: Permission) {
  return user.permissions.includes(permission);
}

export function canAssignRole(actor: AppUser, role: ErpRole) {
  return role !== "ADMIN" && actor.level > ROLE_LEVELS[role];
}

export async function requireAppUser(): Promise<AppUser> {
  const authUser = await getAuthenticatedUser();
  if (!authUser?.email) {
    redirect("/auth/sign-in");
  }

  const email = authUser.email.trim();
  const escapedEmail = email.replace(/[\\%_]/g, "\\$&");
  const matches = await db.orm.public.User
    .where((user) => user.email.ilike(escapedEmail))
    .select("id", "email", "role", "status")
    .limit(2)
    .all();

  if (matches.length !== 1) {
    redirect(`/account?erpAccess=${matches.length === 0 ? "not-provisioned" : "ambiguous"}`);
  }

  const user = matches[0];
  if (String(user.status) !== "ACTIVE") {
    redirect("/account?erpAccess=inactive");
  }

  const effectiveRoles = await getEffectiveRoles(user.id, String(user.role));
  const primaryRole = effectiveRoles.find((role) => role === String(user.role));
  if (!primaryRole) {
    throw new Error(`The EXLS user ${user.id} has no valid primary role.`);
  }

  const permissions = new Set<Permission>();
  for (const role of effectiveRoles) {
    for (const permission of ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: primaryRole,
    status: String(user.status),
    roles: effectiveRoles,
    level: Math.max(...effectiveRoles.map((role) => ROLE_LEVELS[role])),
    permissions: [...permissions],
  };
}

export async function requirePermission(permission: Permission) {
  const user = await requireAppUser();
  if (!hasPermission(user, permission)) {
    notFound();
  }

  return user;
}

export async function requireRole(allowedRoles: readonly string[]) {
  const user = await requireAppUser();
  if (!hasRole(user, allowedRoles)) {
    notFound();
  }

  return user;
}

export async function getAppDataScope(user: AppUser): Promise<AppDataScope> {
  const organizationWide = hasRole(user, MANAGEMENT_ROLES);
  if (organizationWide) {
    return {
      organizationWide: true,
      userIds: new Set([user.id]),
      siteIds: new Set(),
    };
  }

  const userIds = new Set<number>();
  const siteIds = new Set<number>();

  if (user.roles.includes("AGENT")) {
    userIds.add(user.id);
  }

  if (user.roles.includes("SUPERVISOR")) {
    const [supervisedUsers, teamUsers, supervisedSites] = await Promise.all([
      db.orm.public.User.where({ supervisorId: user.id }).select("id").all(),
      db.orm.public.User.where({ teamLeaderId: user.id }).select("id").all(),
      db.orm.public.Site.where({ supervisorId: user.id }).select("id").all(),
    ]);

    userIds.add(user.id);
    for (const member of [...supervisedUsers, ...teamUsers]) {
      userIds.add(member.id);
    }
    for (const site of supervisedSites) {
      siteIds.add(site.id);
    }
  }

  return { organizationWide: false, userIds, siteIds };
}

export function canAccessShiftInScope(
  user: AppUser,
  scope: AppDataScope,
  shift: { agentId: number; supervisorId: number | null; teamLeaderId: number | null; siteId: number },
) {
  return scope.organizationWide ||
    (user.roles.includes("AGENT") && shift.agentId === user.id) ||
    (user.roles.includes("SUPERVISOR") && (
      shift.supervisorId === user.id ||
      shift.teamLeaderId === user.id ||
      scope.userIds.has(shift.agentId) ||
      scope.siteIds.has(shift.siteId)
    ));
}

export async function requireShiftAccess(
  user: AppUser,
  shift: { agentId: number; supervisorId: number | null; teamLeaderId: number | null; siteId: number },
) {
  const scope = await getAppDataScope(user);
  if (!canAccessShiftInScope(user, scope, shift)) {
    notFound();
  }
}
