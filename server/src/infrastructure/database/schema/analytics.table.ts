import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  uuid,
  varchar,
  index,
  date,
} from "drizzle-orm/pg-core";

// Append-only Analytics Event Stream Store
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 100 }).notNull(),
  userId: uuid("user_id"),
  anonymousId: varchar("anonymous_id", { length: 100 }),
  sessionId: varchar("session_id", { length: 100 }),
  movieId: uuid("movie_id"),
  venueId: uuid("venue_id"),
  showId: uuid("show_id"),
  bookingId: uuid("booking_id"),
  platform: varchar("platform", { length: 50 }).default("WEB"),
  device: varchar("device", { length: 50 }).default("DESKTOP"),
  country: varchar("country", { length: 100 }).default("Bangladesh"),
  city: varchar("city", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_analytics_event_name").on(table.eventName),
  index("idx_analytics_user").on(table.userId),
  index("idx_analytics_movie").on(table.movieId),
  index("idx_analytics_occurred_at").on(table.occurredAt),
]);

// Aggregated Daily User Statistics
export const dailyUserStats = pgTable("daily_user_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  totalUsers: integer("total_users").default(0).notNull(),
  newUsers: integer("new_users").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  dau: integer("dau").default(0).notNull(),
  wau: integer("wau").default(0).notNull(),
  mau: integer("mau").default(0).notNull(),
  d1Retention: numeric("d1_retention", { precision: 5, scale: 2 }).default("0.00"),
  d7Retention: numeric("d7_retention", { precision: 5, scale: 2 }).default("0.00"),
  d30Retention: numeric("d30_retention", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Movie Statistics
export const dailyMovieStats = pgTable("daily_movie_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  movieId: uuid("movie_id").notNull(),
  views: integer("views").default(0).notNull(),
  uniqueViewers: integer("unique_viewers").default(0).notNull(),
  searches: integer("searches").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  favorites: integer("favorites").default(0).notNull(),
  showCount: integer("show_count").default(0).notNull(),
  availableSeats: integer("available_seats").default(0).notNull(),
  soldSeats: integer("sold_seats").default(0).notNull(),
  occupancyRate: numeric("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"),
  bookingCount: integer("booking_count").default(0).notNull(),
  ticketCount: integer("ticket_count").default(0).notNull(),
  grossRevenueMinor: integer("gross_revenue_minor").default(0).notNull(),
  netRevenueMinor: integer("net_revenue_minor").default(0).notNull(),
  refundAmountMinor: integer("refund_amount_minor").default(0).notNull(),
  avgTicketPriceMinor: integer("avg_ticket_price_minor").default(0).notNull(),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
  performanceScore: numeric("performance_score", { precision: 8, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_daily_movie_stats_date_movie").on(table.date, table.movieId),
]);

// Aggregated Daily Venue Statistics
export const dailyVenueStats = pgTable("daily_venue_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  venueId: uuid("venue_id").notNull(),
  totalScreens: integer("total_screens").default(0).notNull(),
  totalSeats: integer("total_seats").default(0).notNull(),
  totalShows: integer("total_shows").default(0).notNull(),
  totalBookings: integer("total_bookings").default(0).notNull(),
  ticketsSold: integer("tickets_sold").default(0).notNull(),
  occupancyRate: numeric("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"),
  grossRevenueMinor: integer("gross_revenue_minor").default(0).notNull(),
  netRevenueMinor: integer("net_revenue_minor").default(0).notNull(),
  refundsMinor: integer("refunds_minor").default(0).notNull(),
  avgShowUtilization: numeric("avg_show_utilization", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_daily_venue_stats_date_venue").on(table.date, table.venueId),
]);

// Aggregated Daily Show Statistics
export const dailyShowStats = pgTable("daily_show_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  showId: uuid("show_id").notNull().unique(),
  movieId: uuid("movie_id").notNull(),
  venueId: uuid("venue_id").notNull(),
  screenId: uuid("screen_id").notNull(),
  capacity: integer("capacity").default(0).notNull(),
  availableSeats: integer("available_seats").default(0).notNull(),
  heldSeats: integer("held_seats").default(0).notNull(),
  bookedSeats: integer("booked_seats").default(0).notNull(),
  soldSeats: integer("sold_seats").default(0).notNull(),
  occupancyRate: numeric("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"),
  bookingCount: integer("booking_count").default(0).notNull(),
  ticketCount: integer("ticket_count").default(0).notNull(),
  grossRevenueMinor: integer("gross_revenue_minor").default(0).notNull(),
  discountMinor: integer("discount_minor").default(0).notNull(),
  taxMinor: integer("tax_minor").default(0).notNull(),
  platformFeeMinor: integer("platform_fee_minor").default(0).notNull(),
  netRevenueMinor: integer("net_revenue_minor").default(0).notNull(),
  refundAmountMinor: integer("refund_amount_minor").default(0).notNull(),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Revenue Statistics
export const dailyRevenueStats = pgTable("daily_revenue_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  gmvMinor: integer("gmv_minor").default(0).notNull(),
  grossRevenueMinor: integer("gross_revenue_minor").default(0).notNull(),
  discountsMinor: integer("discounts_minor").default(0).notNull(),
  taxMinor: integer("tax_minor").default(0).notNull(),
  platformFeesMinor: integer("platform_fees_minor").default(0).notNull(),
  convenienceFeesMinor: integer("convenience_fees_minor").default(0).notNull(),
  paymentFeesMinor: integer("payment_fees_minor").default(0).notNull(),
  refundsMinor: integer("refunds_minor").default(0).notNull(),
  netRevenueMinor: integer("net_revenue_minor").default(0).notNull(),
  merchantPayoutsMinor: integer("merchant_payouts_minor").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Hourly Revenue Statistics
export const hourlyRevenueStats = pgTable("hourly_revenue_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  hour: integer("hour").notNull(), // 0-23
  requests: integer("requests").default(0).notNull(),
  bookingAttempts: integer("booking_attempts").default(0).notNull(),
  successfulBookings: integer("successful_bookings").default(0).notNull(),
  grossRevenueMinor: integer("gross_revenue_minor").default(0).notNull(),
  netRevenueMinor: integer("net_revenue_minor").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_hourly_revenue_date_hour").on(table.date, table.hour),
]);

// Aggregated Daily Booking Statistics
export const dailyBookingStats = pgTable("daily_booking_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  bookingAttempts: integer("booking_attempts").default(0).notNull(),
  successfulBookings: integer("successful_bookings").default(0).notNull(),
  failedBookings: integer("failed_bookings").default(0).notNull(),
  expiredBookings: integer("expired_bookings").default(0).notNull(),
  cancelledBookings: integer("cancelled_bookings").default(0).notNull(),
  bookingSuccessRate: numeric("booking_success_rate", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Payment Statistics
export const dailyPaymentStats = pgTable("daily_payment_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  paymentAttempts: integer("payment_attempts").default(0).notNull(),
  successfulPayments: integer("successful_payments").default(0).notNull(),
  failedPayments: integer("failed_payments").default(0).notNull(),
  refundsCount: integer("refunds_count").default(0).notNull(),
  paymentSuccessRate: numeric("payment_success_rate", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Occupancy Statistics
export const dailyOccupancyStats = pgTable("daily_occupancy_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(),
  totalSeatsAvailable: integer("total_seats_available").default(0).notNull(),
  totalSeatsSold: integer("total_seats_sold").default(0).notNull(),
  occupancyRate: numeric("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Coupon Statistics
export const dailyCouponStats = pgTable("daily_coupon_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  couponCode: varchar("coupon_code", { length: 50 }).notNull(),
  applications: integer("applications").default(0).notNull(),
  redemptions: integer("redemptions").default(0).notNull(),
  discountVolumeMinor: integer("discount_volume_minor").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Daily Campaign Statistics
export const dailyCampaignStats = pgTable("daily_campaign_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  campaignId: varchar("campaign_id", { length: 100 }).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  redemptions: integer("redemptions").default(0).notNull(),
  revenueMinor: integer("revenue_minor").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aggregated Hourly Booking Statistics
export const hourlyBookingStats = pgTable("hourly_booking_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  hour: integer("hour").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  success: integer("success").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
