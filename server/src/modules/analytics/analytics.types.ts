export type AnalyticsTimePeriod =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "custom_range";

export type MetricTrend = "UP" | "DOWN" | "FLAT";

export interface ComparisonMetric {
  current: number;
  previous: number;
  change: number;
  percentage: number;
  trend: MetricTrend;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionFromPrevious: number;
  overallConversion: number;
}

export interface MoviePerformanceWeighting {
  viewsWeight: number;
  bookingsWeight: number;
  revenueWeight: number;
  occupancyWeight: number;
  ratingWeight: number;
  growthWeight: number;
}

export const DEFAULT_MOVIE_WEIGHTING: MoviePerformanceWeighting = {
  viewsWeight: 0.15,
  bookingsWeight: 0.25,
  revenueWeight: 0.30,
  occupancyWeight: 0.15,
  ratingWeight: 0.10,
  growthWeight: 0.05,
};

export interface AnalyticsEventPayload {
  eventName: string;
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  movieId?: string;
  venueId?: string;
  showId?: string;
  bookingId?: string;
  platform?: "WEB" | "MOBILE_IOS" | "MOBILE_ANDROID";
  device?: string;
  country?: string;
  city?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}
