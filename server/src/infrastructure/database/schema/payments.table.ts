import {
  pgTable,
  integer,
  timestamp,
  jsonb,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { users } from "./users.table";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).unique(),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  status: varchar("status", { length: 30 }).default("PENDING").notNull(),
  rawWebhookData: jsonb("raw_webhook_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_payments_booking").on(table.bookingId),
]);
