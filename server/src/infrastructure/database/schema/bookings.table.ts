import {
  pgTable,
  integer,
  timestamp,
  uuid,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users.table";
import { shows } from "./shows.table";
import { seats } from "./venues.table";

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingNumber: varchar("booking_number", { length: 50 }).notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id),
  showId: uuid("show_id").notNull().references(() => shows.id),
  holdId: uuid("hold_id").notNull(),
  status: varchar("status", { length: 40 }).default("INITIATED").notNull(),
  totalAmountMinor: integer("total_amount_minor").notNull(),
  discountAmountMinor: integer("discount_amount_minor").default(0).notNull(),
  finalAmountMinor: integer("final_amount_minor").notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_bookings_user").on(table.userId),
  index("idx_bookings_show").on(table.showId),
  index("idx_bookings_status").on(table.status),
]);

export const bookingSeats = pgTable("booking_seats", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  seatId: uuid("seat_id").notNull().references(() => seats.id),
  priceMinor: integer("price_minor").notNull(),
}, (table) => [
  uniqueIndex("idx_booking_seats_booking_seat").on(table.bookingId, table.seatId),
]);
