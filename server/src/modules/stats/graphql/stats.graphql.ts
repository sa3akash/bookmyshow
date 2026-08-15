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

  type ComprehensiveStats {
    system: SystemStats!
    infra: InfraStats!
    business: BusinessStats!
  }

  extend type Query {
    stats: ComprehensiveStats!
    systemStats: SystemStats!
    infraStats: InfraStats!
    businessStats: BusinessStats!
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
  },
};
