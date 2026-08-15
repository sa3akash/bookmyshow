import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { payments } from "./payments.table";
import { users } from "./users.table";

export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  paymentId: uuid("payment_id").notNull().references(() => payments.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  amountMinor: integer("amount_minor").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 30 }).default("PENDING").notNull(),
  refundGatewayTxId: varchar("refund_gateway_tx_id", { length: 255 }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_refunds_booking").on(table.bookingId),
]);
