import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  uuid,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bangladesh").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  uniqueIndex("idx_cities_name_country").on(table.name, table.country),
]);

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  cityId: uuid("city_id").notNull().references(() => cities.id),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_venues_city").on(table.cityId),
]);

export const venueScreens = pgTable("venue_screens", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  supportedFormats: jsonb("supported_formats").$type<string[]>().default(["2D", "3D", "IMAX", "4DX", "DOLBY", "VIP", "PREMIUM"]),
  totalSeats: integer("total_seats").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
  index("idx_screens_venue").on(table.venueId),
]);

export const seats = pgTable("seats", {
  id: uuid("id").defaultRandom().primaryKey(),
  screenId: uuid("screen_id").notNull().references(() => venueScreens.id, { onDelete: "cascade" }),
  rowLabel: varchar("row_label", { length: 10 }).notNull(),
  columnNumber: integer("column_number").notNull(),
  seatNumber: varchar("seat_number", { length: 20 }).notNull(),
  type: varchar("type", { length: 50 }).default("REGULAR").notNull(), // REGULAR, PREMIUM, VIP, RECLINER, COUPLE, ACCESSIBLE, WHEELCHAIR, SOFA, BALCONY, BOX
  category: varchar("category", { length: 50 }).default("Standard").notNull(),
  x: integer("x").default(0).notNull(),
  y: integer("y").default(0).notNull(),
  width: integer("width").default(30).notNull(),
  height: integer("height").default(30).notNull(),
  rotation: integer("rotation").default(0).notNull(),
  priceMultiplier: numeric("price_multiplier", { precision: 4, scale: 2 }).default("1.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
}, (table) => [
  uniqueIndex("idx_seats_screen_seat").on(table.screenId, table.seatNumber),
  index("idx_seats_screen").on(table.screenId),
]);
