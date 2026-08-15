export interface KPIDefinition {
  name: string;
  description: string;
  formula: string;
  dataSource: string;
  aggregation: "SUM" | "AVG" | "COUNT" | "RATIO";
  timeGranularity: "HOURLY" | "DAILY" | "MONTHLY";
}

export const CORE_KPIS: Record<string, KPIDefinition> = {
  GMV: {
    name: "Gross Merchandise Value",
    description: "Total monetary volume of all ticket bookings generated prior to refunds",
    formula: "SUM(booking.totalAmountMinor)",
    dataSource: "daily_revenue_stats",
    aggregation: "SUM",
    timeGranularity: "DAILY",
  },
  NetRevenue: {
    name: "Net Revenue",
    description: "Gross revenue minus discounts and refunds plus platform fees and taxes",
    formula: "gross_revenue - discounts - refunds + fees + taxes",
    dataSource: "daily_revenue_stats",
    aggregation: "SUM",
    timeGranularity: "DAILY",
  },
  OccupancyRate: {
    name: "Occupancy Rate",
    description: "Percentage of total sellable screen seats occupied by paid tickets",
    formula: "(sold_seats / total_sellable_seats) * 100",
    dataSource: "daily_show_stats",
    aggregation: "RATIO",
    timeGranularity: "DAILY",
  },
  BookingConversion: {
    name: "Booking Conversion Rate",
    description: "Percentage of total seat booking attempts that result in confirmed tickets",
    formula: "(confirmed_bookings / booking_attempts) * 100",
    dataSource: "hourly_revenue_stats",
    aggregation: "RATIO",
    timeGranularity: "HOURLY",
  },
  PaymentSuccessRate: {
    name: "Payment Success Rate",
    description: "Percentage of payment provider intents successfully authorized",
    formula: "(successful_payments / payment_attempts) * 100",
    dataSource: "daily_payment_stats",
    aggregation: "RATIO",
    timeGranularity: "DAILY",
  },
  AverageOrderValue: {
    name: "Average Order Value (AOV)",
    description: "Average net ticket transaction size per confirmed booking",
    formula: "net_revenue / successful_bookings",
    dataSource: "daily_revenue_stats",
    aggregation: "RATIO",
    timeGranularity: "DAILY",
  },
  RefundRate: {
    name: "Refund Rate",
    description: "Percentage of confirmed bookings resulting in refund requests",
    formula: "(refunded_bookings / confirmed_bookings) * 100",
    dataSource: "daily_revenue_stats",
    aggregation: "RATIO",
    timeGranularity: "DAILY",
  },
};
