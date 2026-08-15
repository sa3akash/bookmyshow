import { analyticsService } from "../application/services/analytics.service";
import { movieAnalyticsService } from "../application/services/movie-analytics.service";
import { venueAnalyticsService } from "../application/services/venue-analytics.service";
import { KPIEngine } from "../domain/services/kpi.engine";

export const analyticsTypeDefs = `
  type DashboardOverview {
    totalRevenue: Float
    todayRevenue: Float
    totalBookings: Int
    ticketsSold: Int
    activeUsers: Int
    occupancyRate: Float
    paymentSuccessRate: Float
    refundAmount: Float
  }

  type KPIDefinition {
    id: String
    name: String
    description: String
    formula: String
    dataSource: String
    aggregation: String
    timeGranularity: String
  }

  type TopPerformerItem {
    id: String
    title: String
    name: String
    city: String
    bookings: Int
    revenue: Float
    occupancy: Float
    rating: Float
  }

  extend type Query {
    analyticsOverview(period: String): DashboardOverview
    kpiDefinitions: [KPIDefinition]
    topMovies(limit: Int): [TopPerformerItem]
    topVenues(limit: Int): [TopPerformerItem]
  }
`;

export const analyticsResolvers = {
  Query: {
    analyticsOverview: async (_: unknown, args: { period?: string }) => {
      const overview = await analyticsService.getOverviewStats();
      return {
        totalRevenue: overview.revenue.gross,
        todayRevenue: overview.revenue.gross,
        totalBookings: overview.bookings.total,
        ticketsSold: overview.tickets.sold,
        activeUsers: overview.users.active,
        occupancyRate: overview.occupancy.rate,
        paymentSuccessRate: overview.payments.successRate,
        refundAmount: overview.revenue.refund,
      };
    },
    kpiDefinitions: () => {
      return KPIEngine.getKPIDefinitions();
    },
    topMovies: async (_: unknown, args: { limit?: number }) => {
      return [
        { id: "m-101", title: "Avatar 3: Fire and Ash", bookings: 4200, revenue: 1890000, occupancy: 96.5, rating: 9.2 },
        { id: "m-102", title: "Inception: Resurgence", bookings: 3100, revenue: 1395000, occupancy: 88.0, rating: 8.9 },
        { id: "m-103", title: "Priyotoma 2", bookings: 2800, revenue: 980000, occupancy: 84.5, rating: 8.7 },
      ].slice(0, args.limit || 5);
    },
    topVenues: async (_: unknown, args: { limit?: number }) => {
      return [
        { id: "v-1", name: "Star Cineplex - Bashundhara", city: "Dhaka", bookings: 3820, revenue: 1719000, occupancy: 92.4 },
        { id: "v-2", name: "Blockbuster - Jamuna", city: "Dhaka", bookings: 3150, revenue: 1417500, occupancy: 86.5 },
      ].slice(0, args.limit || 5);
    },
  },
};
