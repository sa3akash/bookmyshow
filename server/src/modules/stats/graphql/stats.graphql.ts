import { statsService } from "../stats.service";

export const statsTypeDefs = `
  type MemoryStats {
    rssMb: Float!
    heapTotalMb: Float!
    heapUsedMb: Float!
    externalMb: Float!
  }

  type CpuStats {
    userMs: Int!
    systemMs: Int!
  }

  type SystemStats {
    runtime: String!
    version: String!
    uptimeSeconds: Int!
    uptimeHuman: String!
    memory: MemoryStats!
    cpu: CpuStats!
    timestamp: String!
  }

  type ComponentHealth {
    status: String!
    healthy: Boolean!
  }

  type MetricStats {
    totalHttpRequests: Int!
    activeConnections: Int!
  }

  type InfraStats {
    database: ComponentHealth!
    redis: ComponentHealth!
    metrics: MetricStats!
  }

  type BusinessStats {
    totalBookings: Int!
    totalMovies: Int!
    activeShows: Int!
    activeSeatHolds: Int!
  }

  type BoxOfficeMovieItem {
    movieId: String!
    title: String!
    ticketsSold: Int!
    grossRevenueMinor: Float!
    grossRevenueBDT: Float!
  }

  type BoxOfficeStats {
    totalGrossBoxOfficeMinor: Float!
    totalGrossBoxOfficeBDT: Float!
    todayBoxOfficeMinor: Float!
    todayBoxOfficeBDT: Float!
    totalTicketsSold: Int!
    topGrossingMovies: [BoxOfficeMovieItem!]!
  }

  type FinancialIncomeStats {
    grossTicketSalesMinor: Float!
    grossTicketSalesBDT: Float!
    platformFeeIncomeMinor: Float!
    platformFeeIncomeBDT: Float!
    taxCollectedMinor: Float!
    taxCollectedBDT: Float!
    merchantPayoutsMinor: Float!
    merchantPayoutsBDT: Float!
    totalRefundsProcessedMinor: Float!
    totalRefundsProcessedBDT: Float!
    netPlatformIncomeMinor: Float!
    netPlatformIncomeBDT: Float!
  }

  type ComprehensiveStats {
    system: SystemStats!
    infra: InfraStats!
    business: BusinessStats!
    boxOffice: BoxOfficeStats!
    income: FinancialIncomeStats!
  }

  extend type Query {
    stats: ComprehensiveStats!
    systemStats: SystemStats!
    infraStats: InfraStats!
    businessStats: BusinessStats!
    boxOfficeStats: BoxOfficeStats!
    incomeStats: FinancialIncomeStats!
  }
`;

export const statsResolvers = {
  Query: {
    stats: async () => {
      return await statsService.getComprehensiveStats();
    },
    systemStats: async () => {
      return statsService.getSystemStats();
    },
    infraStats: async () => {
      return await statsService.getInfraStats();
    },
    businessStats: async () => {
      return await statsService.getBusinessStats();
    },
    boxOfficeStats: async () => {
      return await statsService.getBoxOfficeStats();
    },
    incomeStats: async () => {
      return await statsService.getIncomeStats();
    },
  },
};
