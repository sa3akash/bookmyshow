CREATE TABLE "event_performers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(100),
	"image_url" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "event_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"tier_name" varchar(100) NOT NULL,
	"price_minor" integer NOT NULL,
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"venue_name" varchar(255) NOT NULL,
	"address" text,
	"banner_url" varchar(512),
	"poster_url" varchar(512),
	"status" varchar(30) DEFAULT 'UPCOMING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_cast" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" uuid NOT NULL,
	"actor_name" varchar(255) NOT NULL,
	"character_name" varchar(255),
	"profile_image_url" varchar(512),
	"role_type" varchar(50) DEFAULT 'LEAD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"job_title" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" varchar(512) NOT NULL,
	"title" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "event_performers" ADD CONSTRAINT "event_performers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_slots" ADD CONSTRAINT "event_slots_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_cast" ADD CONSTRAINT "movie_cast_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_crew" ADD CONSTRAINT "movie_crew_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_media" ADD CONSTRAINT "movie_media_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;