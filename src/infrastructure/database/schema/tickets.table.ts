import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { users } from "./users.table";
import { shows } from "./shows.table";

export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketCode: varchar("ticket_code", { length: 100 }).notNull().unique(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  showId: uuid("show_id").notNull().references(() => shows.id),
  qrData: text("qr_data").notNull(),
  status: varchar("status", { length: 30 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_tickets_user").on(table.userId),
]);
