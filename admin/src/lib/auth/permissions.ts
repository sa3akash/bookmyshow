export type Permission =
  | "dashboard:view"
  | "user:view"
  | "user:create"
  | "user:update"
  | "user:disable"
  | "user:delete"
  | "movie:view"
  | "movie:create"
  | "movie:update"
  | "movie:publish"
  | "movie:archive"
  | "movie:delete"
  | "venue:view"
  | "venue:create"
  | "venue:update"
  | "venue:delete"
  | "screen:view"
  | "screen:create"
  | "screen:update"
  | "seat:view"
  | "seat:create"
  | "seat:update"
  | "seat:block"
  | "seat:unblock"
  | "show:view"
  | "show:create"
  | "show:update"
  | "show:cancel"
  | "show:publish"
  | "booking:view"
  | "booking:create"
  | "booking:cancel"
  | "booking:modify"
  | "payment:view"
  | "payment:refund"
  | "payment:reconcile"
  | "coupon:view"
  | "coupon:create"
  | "coupon:update"
  | "coupon:delete"
  | "analytics:view"
  | "analytics:financial"
  | "analytics:export"
  | "report:view"
  | "report:generate"
  | "report:export"
  | "admin:view"
  | "admin:create"
  | "admin:update"
  | "admin:disable"
  | "role:view"
  | "role:create"
  | "role:update"
  | "role:delete"
  | "audit:view"
  | "settings:view"
  | "settings:update";

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CONTENT_MANAGER"
  | "MOVIE_MANAGER"
  | "VENUE_MANAGER"
  | "SHOW_MANAGER"
  | "BOOKING_MANAGER"
  | "PAYMENT_MANAGER"
  | "FINANCE_MANAGER"
  | "MARKETING_MANAGER"
  | "CUSTOMER_SUPPORT"
  | "ANALYST"
  | "AUDITOR";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  avatarUrl?: string;
  cityScope?: string;
  venueScope?: string;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "user:view", "user:create", "user:update", "user:disable", "user:delete",
    "movie:view", "movie:create", "movie:update", "movie:publish", "movie:archive", "movie:delete",
    "venue:view", "venue:create", "venue:update", "venue:delete",
    "screen:view", "screen:create", "screen:update",
    "seat:view", "seat:create", "seat:update", "seat:block", "seat:unblock",
    "show:view", "show:create", "show:update", "show:cancel", "show:publish",
    "booking:view", "booking:create", "booking:cancel", "booking:modify",
    "payment:view", "payment:refund", "payment:reconcile",
    "coupon:view", "coupon:create", "coupon:update", "coupon:delete",
    "analytics:view", "analytics:financial", "analytics:export",
    "report:view", "report:generate", "report:export",
    "admin:view", "admin:create", "admin:update", "admin:disable",
    "role:view", "role:create", "role:update", "role:delete",
    "audit:view", "settings:view", "settings:update",
  ],
  ADMIN: [
    "dashboard:view", "user:view", "user:create", "user:update",
    "movie:view", "movie:create", "movie:update", "movie:publish",
    "venue:view", "venue:create", "venue:update",
    "screen:view", "screen:create", "screen:update",
    "seat:view", "seat:create", "seat:update", "seat:block",
    "show:view", "show:create", "show:update", "show:cancel", "show:publish",
    "booking:view", "booking:cancel", "payment:view", "payment:refund",
    "coupon:view", "coupon:create", "analytics:view", "report:view", "report:generate",
  ],
  CONTENT_MANAGER: ["dashboard:view", "movie:view", "movie:create", "movie:update", "movie:publish", "movie:archive"],
  MOVIE_MANAGER: ["dashboard:view", "movie:view", "movie:create", "movie:update", "movie:publish", "show:view", "show:create"],
  VENUE_MANAGER: ["dashboard:view", "venue:view", "venue:create", "venue:update", "screen:view", "screen:create", "seat:view", "seat:update", "seat:block", "show:view"],
  SHOW_MANAGER: ["dashboard:view", "show:view", "show:create", "show:update", "show:cancel", "show:publish"],
  BOOKING_MANAGER: ["dashboard:view", "booking:view", "booking:create", "booking:cancel", "booking:modify", "user:view"],
  PAYMENT_MANAGER: ["dashboard:view", "payment:view", "payment:refund", "payment:reconcile", "booking:view"],
  FINANCE_MANAGER: ["dashboard:view", "payment:view", "payment:refund", "payment:reconcile", "analytics:view", "analytics:financial", "analytics:export", "report:view", "report:generate"],
  MARKETING_MANAGER: ["dashboard:view", "coupon:view", "coupon:create", "coupon:update", "coupon:delete", "analytics:view"],
  CUSTOMER_SUPPORT: ["dashboard:view", "user:view", "booking:view", "booking:cancel", "payment:view"],
  ANALYST: ["dashboard:view", "analytics:view", "analytics:export", "report:view"],
  AUDITOR: ["dashboard:view", "audit:view", "analytics:view"],
};

export function can(user?: UserSession | null, permission?: Permission): boolean {
  if (!user || !permission) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;
  if (Array.isArray(user.permissions) && user.permissions.includes(permission)) return true;
  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.role];
  if (defaultPerms && defaultPerms.includes(permission)) return true;
  return false;
}

export function hasRole(user?: UserSession | null, role?: Role): boolean {
  if (!user || !role) return false;
  return user.role === role;
}

export function hasAnyRole(user?: UserSession | null, roles: Role[] = []): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function hasAllPermissions(user?: UserSession | null, permissions: Permission[] = []): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return permissions.every((p) => user.permissions.includes(p));
}
