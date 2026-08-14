import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { movies } from "./movies.table";
import { users } from "./users.table";
import { venues } from "./venues.table";

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: integer("discount_value").notNull(),
  maxDiscountMinor: integer("max_discount_minor"),
  minOrderMinor: integer("min_order_minor").default(0).notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  key: varchar("key", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull(),
  requestHash: varchar("request_hash", { length: 64 }).notNull(),
  responseStatus: integer("response_status").notNull(),
  responseBody: jsonb("response_body").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  aggregateType: varchar("aggregate_type", { length: 50 }).notNull(),
  aggregateId: varchar("aggregate_id", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  availableAt: timestamp("available_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_outbox_status_available").on(table.status, table.availableAt),
]);

export const financialLedger = pgTable("financial_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryType: varchar("entry_type", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  referenceType: varchar("reference_type", { length: 50 }).notNull(),
  referenceId: varchar("reference_id", { length: 255 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_ledger_ref").on(table.referenceType, table.referenceId),
]);

export const settlements = pgTable("settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull().references(() => venues.id),
  settlementNumber: varchar("settlement_number", { length: 50 }).notNull().unique(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  totalTicketRevenueMinor: integer("total_ticket_revenue_minor").notNull(),
  platformFeeMinor: integer("platform_fee_minor").notNull(),
  taxAmountMinor: integer("tax_amount_minor").notNull(),
  netPayoutMinor: integer("net_payout_minor").notNull(),
  status: varchar("status", { length: 30 }).default("PENDING").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  discountPercentage: integer("discount_percentage"),
  freeSeatsCount: integer("free_seats_count"),
  maxDiscountMinor: integer("max_discount_minor"),
  minOrderMinor: integer("min_order_minor").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 100 }),
  payload: jsonb("payload"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
