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

export const movies = pgTable("movies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  languages: jsonb("languages").$type<string[]>().default([]).notNull(),
  genres: jsonb("genres").$type<string[]>().default([]).notNull(),
  releaseDate: timestamp("release_date", { withTimezone: true }).notNull(),
  rating: varchar("rating", { length: 20 }).default("PG-13"),
  posterUrl: text("poster_url"),
  bannerUrl: text("banner_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_movies_title").on(table.title),
]);

export const movieCast = pgTable("movie_cast", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  actorName: varchar("actor_name", { length: 255 }).notNull(),
  characterName: varchar("character_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  roleType: varchar("role_type", { length: 50 }).default("LEAD").notNull(),
});

export const movieCrew = pgTable("movie_crew", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  jobTitle: varchar("job_title", { length: 100 }).notNull(),
});

export const movieMedia = pgTable("movie_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  title: varchar("title", { length: 255 }),
});
