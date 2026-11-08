import "server-only";

import { notFound, redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import {
 
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
  toErpRole,
} from "@/lib/rbac";
import type { AppUser, ErpRole, Permission } from "@/lib/rbac";

export {
  ERP_ROLES,
  PERMISSIONS,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  
  canAssignRole,
  hasPermission,
  hasRole,
  isErpRole,
} from "@/lib/rbac";
export type { AppUser, ErpRole, Permission } from "@/lib/rbac";

export type AppDataScope = {
  organizationWide: boolean;
  userIds: ReadonlySet<string>;
  siteIds: ReadonlySet<string>;
};

export async function getEffectiveRoles(userId: string, primaryRole: string) {
  const effectivePrimaryRole = toErpRole(primaryRole);
  if (effectivePrimaryRole === null) {
    throw new Error(`The EXLS user ${userId} has an unsupported primary role.`);
  }

  const assignedRoles = await db.orm.public.RoleAssignment
    .where({ userId })
    .select("role")
    .all();
  const assignedRoleValues = assignedRoles.map((assignment) =>
    toErpRole(String(assignment.role)),
  );
  if (assignedRoleValues.some((role) => role === null)) {
    throw new Error(`The EXLS user ${userId} has an unsupported role assignment.`);
  }
  const validAssignedRoles = assignedRoleValues.filter(
    (role): role is ErpRole => role !== null,
  );

  if (effectivePrimaryRole !== "ADMIN" && validAssignedRoles.includes("ADMIN")) {
    throw new Error(`The EXLS user ${userId} has an invalid ADMIN role assignment.`);
  }

  return [...new Set<ErpRole>([effectivePrimaryRole, ...validAssignedRoles])];
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
    .select("id", "email", "firstName", "lastName", "role", "status")
    .limit(2)
    .all();

  if (matches.length !== 1) {
    redirect(`/account?erpAccess=${matches.length === 0 ? "not-provisioned" : "ambiguous"}`);
  }

  const user = matches[0];
  if (String(user.status) !== "ACTIVE") {
    redirect("/account?erpAccess=inactive");
  }

  const primaryRole = toErpRole(String(user.role));
  if (primaryRole === null) {
    redirect("/account?erpAccess=role-required");
  }
  const effectiveRoles = await getEffectiveRoles(user.id, String(user.role));

  const permissions = new Set<Permission>();
  for (const role of effectiveRoles) {
    for (const permission of ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
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
  const organizationWide = hasRole(user, ["SUPER_ADMIN"]);
  if (organizationWide) {
    return {
      organizationWide: true,
      userIds: new Set([user.id]),
      siteIds: new Set(),
    };
  }

  const userIds = new Set<string>();
  const siteIds = new Set<string>();

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
  shift: { agentId: string; supervisorId: string | null; teamLeaderId: string | null; siteId: string },
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
  shift: { agentId: string; supervisorId: string | null; teamLeaderId: string | null; siteId: string },
) {
  const scope = await getAppDataScope(user);
  if (!canAccessShiftInScope(user, scope, shift)) {
    notFound();
  }
}
