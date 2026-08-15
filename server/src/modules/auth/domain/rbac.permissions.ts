export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MOVIE_MANAGER"
  | "VENUE_MANAGER"
  | "SUPPORT_AGENT"
  | "FINANCE_MANAGER"
  | "CONTENT_MANAGER"
  | "CUSTOMER";

export type PermissionName =
  // Movies & Media
  | "movie:create"
  | "movie:update"
  | "movie:delete"
  | "movie:read"
  // Shows & Seats
  | "show:create"
  | "show:update"
  | "show:cancel"
  | "show:read"
  // Venues & Cities
  | "venue:create"
  | "venue:update"
  | "venue:read"
  // Events & Concerts
  | "event:create"
  | "event:update"
  | "event:read"
  // Bookings
  | "booking:create"
  | "booking:read"
  | "booking:cancel"
  | "booking:read_all"
  // Payments & Wallet
  | "payment:create"
  | "payment:read"
  | "wallet:topup"
  | "wallet:read"
  // Refunds & Compensating Actions
  | "refund:create"
  | "refund:read"
  | "refund:process"
  // Settlements & Financial Accounting
  | "settlement:create"
  | "settlement:read"
  // Admin & System Metrics
  | "admin:read"
  | "admin:metrics"
  | "admin:reconcile";

export const ROLE_PERMISSIONS_MAP: Record<RoleName, PermissionName[]> = {
  SUPER_ADMIN: [
    "movie:create", "movie:update", "movie:delete", "movie:read",
    "show:create", "show:update", "show:cancel", "show:read",
    "venue:create", "venue:update", "venue:read",
    "event:create", "event:update", "event:read",
    "booking:create", "booking:read", "booking:cancel", "booking:read_all",
    "payment:create", "payment:read", "wallet:topup", "wallet:read",
    "refund:create", "refund:read", "refund:process",
    "settlement:create", "settlement:read",
    "admin:read", "admin:metrics", "admin:reconcile",
  ],
  ADMIN: [
    "movie:create", "movie:update", "movie:read",
    "show:create", "show:update", "show:cancel", "show:read",
    "venue:create", "venue:update", "venue:read",
    "event:create", "event:update", "event:read",
    "booking:read", "booking:cancel", "booking:read_all",
    "payment:read", "refund:create", "refund:read",
    "settlement:read", "admin:read", "admin:metrics",
  ],
  MOVIE_MANAGER: [
    "movie:create", "movie:update", "movie:read",
    "show:create", "show:update", "show:cancel", "show:read",
  ],
  VENUE_MANAGER: [
    "venue:create", "venue:update", "venue:read",
    "show:create", "show:update", "show:read",
    "settlement:read",
  ],
  SUPPORT_AGENT: [
    "booking:read", "booking:read_all", "booking:cancel",
    "refund:create", "refund:read",
    "movie:read", "show:read", "venue:read",
  ],
  FINANCE_MANAGER: [
    "payment:read", "refund:create", "refund:read", "refund:process",
    "settlement:create", "settlement:read", "admin:metrics",
  ],
  CONTENT_MANAGER: [
    "movie:create", "movie:update", "movie:read",
    "event:create", "event:update", "event:read",
  ],
  CUSTOMER: [
    "movie:read", "show:read", "venue:read", "event:read",
    "booking:create", "booking:read", "booking:cancel",
    "payment:create", "payment:read", "wallet:topup", "wallet:read",
  ],
};
