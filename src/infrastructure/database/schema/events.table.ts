import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { cities } from "./venues.table";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  cityId: uuid("city_id").references(() => cities.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  address: text("address"),
  bannerUrl: varchar("banner_url", { length: 512 }),
  posterUrl: varchar("poster_url", { length: 512 }),
  status: varchar("status", { length: 30 }).default("UPCOMING").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventPerformers = pgTable("event_performers", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  imageUrl: varchar("image_url", { length: 512 }),
});

export const eventSlots = pgTable("event_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  tierName: varchar("tier_name", { length: 100 }).notNull(),
  priceMinor: integer("price_minor").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
