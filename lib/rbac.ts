/** Application roles ordered by access level. */
export const ERP_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "SUPERVISOR",
  "TEAM_LEADER",
  "AGENT",
  "USER"
] as const;

export type ErpRole = (typeof ERP_ROLES)[number];

/** Higher values represent broader access. */
export const ROLE_LEVELS: Readonly<Record<ErpRole, number>> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MANAGER: 3,
  SUPERVISOR: 4,
  TEAM_LEADER: 5,
  AGENT: 6,
  USER: 7,
};

export const PERMISSIONS = [
  "dashboard:read",
  "profile:read:self",
  "employees:read",
  "employees:create",
  "employees:archive",
  "employees:restore",
  "clients:read",
  "clients:create",
  "clients:update",
  "clients:archive",
  "clients:restore",
  "sites:read",
  "sites:create",
  "sites:update",
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
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: PERMISSIONS,
  MANAGER: PERMISSIONS,
  SUPERVISOR: [
    "profile:read:self",
    "missions:read",
    "attendance:read",
    "attendance:create:team",
    "attendance:verify",
    "reports:read",
  ],
  TEAM_LEADER: ["profile:read:self", "missions:read", "attendance:read", "attendance:create:team"],
  AGENT: ["profile:read:self", "attendance:read", "attendance:create:self"],
  USER: ["profile:read:self"],
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: ErpRole;
  status: string;
  roles: ErpRole[];
  level: number;
  permissions: Permission[];
};

export function isErpRole(value: string): value is ErpRole {
  return (ERP_ROLES as readonly string[]).includes(value);
}

export function hasRole(user: Pick<AppUser, "roles">, roles: readonly string[]) {
  return user.roles.some((role) => roles.includes(role));
}

export function hasPermission(user: Pick<AppUser, "permissions">, permission: Permission) {
  return user.permissions.includes(permission);
}

export function canAssignRole(actor: Pick<AppUser, "level">, role: ErpRole) {
  return role !== "SUPER_ADMIN" && actor.level > ROLE_LEVELS[role];
}

export function toErpRole(value: string): ErpRole | null {
  return isErpRole(value) ? value : null;
}