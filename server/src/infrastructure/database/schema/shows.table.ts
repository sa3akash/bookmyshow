import {
  pgTable,
  integer,
  timestamp,
  uuid,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { movies } from "./movies.table";
import { venueScreens, seats } from "./venues.table";
import { users } from "./users.table";
import { bookings } from "./bookings.table";

export const shows = pgTable("shows", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id").notNull().references(() => movies.id),
  screenId: uuid("screen_id").notNull().references(() => venueScreens.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  format: varchar("format", { length: 20 }).notNull(),
  basePriceMinor: integer("base_price_minor").notNull(),
  status: varchar("status", { length: 30 }).default("SCHEDULED").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_shows_movie").on(table.movieId),
  index("idx_shows_screen_time").on(table.screenId, table.startTime, table.endTime),
]);

export const seatLocks = pgTable("seat_locks", {
  id: uuid("id").defaultRandom().primaryKey(),
  showId: uuid("show_id").notNull().references(() => shows.id),
  seatId: uuid("seat_id").notNull().references(() => seats.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  holdId: uuid("hold_id").notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  status: varchar("status", { length: 30 }).default("HELD").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_seat_locks_show_seat_active")
    .on(table.showId, table.seatId)
    .where(sql`status = 'HELD'`),
  index("idx_seat_locks_hold").on(table.holdId),
  index("idx_seat_locks_user").on(table.userId),
  index("idx_seat_locks_booking").on(table.bookingId),
]);
