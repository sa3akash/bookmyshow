CREATE TABLE "user_mfa_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mfa_secrets" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"totp_secret" text NOT NULL,
	"is_totp_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_passkeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" varchar(512) NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"device_name" varchar(255) DEFAULT 'Passkey Authenticator' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "user_passkeys_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" varchar(100) NOT NULL,
	"user_id" uuid,
	"anonymous_id" varchar(100),
	"session_id" varchar(100),
	"movie_id" uuid,
	"venue_id" uuid,
	"show_id" uuid,
	"booking_id" uuid,
	"platform" varchar(50) DEFAULT 'WEB',
	"device" varchar(50) DEFAULT 'DESKTOP',
	"country" varchar(100) DEFAULT 'Bangladesh',
	"city" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_booking_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"booking_attempts" integer DEFAULT 0 NOT NULL,
	"successful_bookings" integer DEFAULT 0 NOT NULL,
	"failed_bookings" integer DEFAULT 0 NOT NULL,
	"expired_bookings" integer DEFAULT 0 NOT NULL,
	"cancelled_bookings" integer DEFAULT 0 NOT NULL,
	"booking_success_rate" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_booking_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_campaign_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"campaign_id" varchar(100) NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"redemptions" integer DEFAULT 0 NOT NULL,
	"revenue_minor" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_coupon_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"coupon_code" varchar(50) NOT NULL,
	"applications" integer DEFAULT 0 NOT NULL,
	"redemptions" integer DEFAULT 0 NOT NULL,
	"discount_volume_minor" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_movie_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"movie_id" uuid NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"unique_viewers" integer DEFAULT 0 NOT NULL,
	"searches" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"favorites" integer DEFAULT 0 NOT NULL,
	"show_count" integer DEFAULT 0 NOT NULL,
	"available_seats" integer DEFAULT 0 NOT NULL,
	"sold_seats" integer DEFAULT 0 NOT NULL,
	"occupancy_rate" numeric(5, 2) DEFAULT '0.00',
	"booking_count" integer DEFAULT 0 NOT NULL,
	"ticket_count" integer DEFAULT 0 NOT NULL,
	"gross_revenue_minor" integer DEFAULT 0 NOT NULL,
	"net_revenue_minor" integer DEFAULT 0 NOT NULL,
	"refund_amount_minor" integer DEFAULT 0 NOT NULL,
	"avg_ticket_price_minor" integer DEFAULT 0 NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0.00',
	"performance_score" numeric(8, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_occupancy_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"total_seats_available" integer DEFAULT 0 NOT NULL,
	"total_seats_sold" integer DEFAULT 0 NOT NULL,
	"occupancy_rate" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_occupancy_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_payment_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"payment_attempts" integer DEFAULT 0 NOT NULL,
	"successful_payments" integer DEFAULT 0 NOT NULL,
	"failed_payments" integer DEFAULT 0 NOT NULL,
	"refunds_count" integer DEFAULT 0 NOT NULL,
	"payment_success_rate" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_payment_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_revenue_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"gmv_minor" integer DEFAULT 0 NOT NULL,
	"gross_revenue_minor" integer DEFAULT 0 NOT NULL,
	"discounts_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"platform_fees_minor" integer DEFAULT 0 NOT NULL,
	"convenience_fees_minor" integer DEFAULT 0 NOT NULL,
	"payment_fees_minor" integer DEFAULT 0 NOT NULL,
	"refunds_minor" integer DEFAULT 0 NOT NULL,
	"net_revenue_minor" integer DEFAULT 0 NOT NULL,
	"merchant_payouts_minor" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_revenue_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_show_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"show_id" uuid NOT NULL,
	"movie_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"screen_id" uuid NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"available_seats" integer DEFAULT 0 NOT NULL,
	"held_seats" integer DEFAULT 0 NOT NULL,
	"booked_seats" integer DEFAULT 0 NOT NULL,
	"sold_seats" integer DEFAULT 0 NOT NULL,
	"occupancy_rate" numeric(5, 2) DEFAULT '0.00',
	"booking_count" integer DEFAULT 0 NOT NULL,
	"ticket_count" integer DEFAULT 0 NOT NULL,
	"gross_revenue_minor" integer DEFAULT 0 NOT NULL,
	"discount_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"platform_fee_minor" integer DEFAULT 0 NOT NULL,
	"net_revenue_minor" integer DEFAULT 0 NOT NULL,
	"refund_amount_minor" integer DEFAULT 0 NOT NULL,
	"conversion_rate" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_show_stats_show_id_unique" UNIQUE("show_id")
);
--> statement-breakpoint
CREATE TABLE "daily_user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"new_users" integer DEFAULT 0 NOT NULL,
	"active_users" integer DEFAULT 0 NOT NULL,
	"dau" integer DEFAULT 0 NOT NULL,
	"wau" integer DEFAULT 0 NOT NULL,
	"mau" integer DEFAULT 0 NOT NULL,
	"d1_retention" numeric(5, 2) DEFAULT '0.00',
	"d7_retention" numeric(5, 2) DEFAULT '0.00',
	"d30_retention" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_user_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_venue_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"venue_id" uuid NOT NULL,
	"total_screens" integer DEFAULT 0 NOT NULL,
	"total_seats" integer DEFAULT 0 NOT NULL,
	"total_shows" integer DEFAULT 0 NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"tickets_sold" integer DEFAULT 0 NOT NULL,
	"occupancy_rate" numeric(5, 2) DEFAULT '0.00',
	"gross_revenue_minor" integer DEFAULT 0 NOT NULL,
	"net_revenue_minor" integer DEFAULT 0 NOT NULL,
	"refunds_minor" integer DEFAULT 0 NOT NULL,
	"avg_show_utilization" numeric(5, 2) DEFAULT '0.00',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hourly_booking_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"hour" integer NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"success" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hourly_revenue_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"hour" integer NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"booking_attempts" integer DEFAULT 0 NOT NULL,
	"successful_bookings" integer DEFAULT 0 NOT NULL,
	"gross_revenue_minor" integer DEFAULT 0 NOT NULL,
	"net_revenue_minor" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seats" ALTER COLUMN "type" SET DEFAULT 'REGULAR';--> statement-breakpoint
ALTER TABLE "venue_screens" ALTER COLUMN "supported_formats" SET DEFAULT '["2D","3D","IMAX","4DX","DOLBY","VIP","PREMIUM"]'::jsonb;--> statement-breakpoint
ALTER TABLE "seat_locks" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "width" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "height" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "rotation" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "user_mfa_recovery_codes" ADD CONSTRAINT "user_mfa_recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_secrets" ADD CONSTRAINT "user_mfa_secrets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_passkeys" ADD CONSTRAINT "user_passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mfa_recovery_user" ON "user_mfa_recovery_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mfa_recovery_hash" ON "user_mfa_recovery_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "idx_passkeys_user" ON "user_passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_passkeys_cred_id" ON "user_passkeys" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_event_name" ON "analytics_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "idx_analytics_user" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_movie" ON "analytics_events" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_occurred_at" ON "analytics_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_daily_movie_stats_date_movie" ON "daily_movie_stats" USING btree ("date","movie_id");--> statement-breakpoint
CREATE INDEX "idx_daily_venue_stats_date_venue" ON "daily_venue_stats" USING btree ("date","venue_id");--> statement-breakpoint
CREATE INDEX "idx_hourly_revenue_date_hour" ON "hourly_revenue_stats" USING btree ("date","hour");--> statement-breakpoint
ALTER TABLE "seat_locks" ADD CONSTRAINT "seat_locks_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_seat_locks_booking" ON "seat_locks" USING btree ("booking_id");