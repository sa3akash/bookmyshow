import { db, checkDatabaseHealth } from "@/infrastructure/database/client";
import { redis, checkRedisHealth } from "@/infrastructure/redis/client";
import { metrics } from "@/core/observability/metrics";
import { bookings } from "@/infrastructure/database/schema/bookings.table";
import { movies } from "@/infrastructure/database/schema/movies.table";
import { shows, seatLocks } from "@/infrastructure/database/schema/shows.table";
import { count, gt } from "drizzle-orm";

export interface SystemStats {
  runtime: string;
  version: string;
  uptimeSeconds: number;
  uptimeHuman: string;
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
  };
  cpu: {
    userMs: number;
    systemMs: number;
  };
  timestamp: string;
}

export interface InfraStats {
  database: {
    status: string;
    healthy: boolean;
  };
  redis: {
    status: string;
    healthy: boolean;
  };
  metrics: {
    totalHttpRequests: number;
    activeConnections: number;
  };
}

export interface BusinessStats {
  totalBookings: number;
  totalMovies: number;
  activeShows: number;
  activeSeatHolds: number;
}

export interface ComprehensiveStats {
  system: SystemStats;
  infra: InfraStats;
  business: BusinessStats;
}

class StatsService {
  public getSystemStats(): SystemStats {
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const uptimeHuman = `${hours}h ${minutes}m ${seconds}s`;

    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      runtime: typeof Bun !== "undefined" ? "Bun" : "Node.js",
      version: typeof Bun !== "undefined" ? Bun.version : process.version,
      uptimeSeconds: uptimeSec,
      uptimeHuman,
      memory: {
        rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
        heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
        externalMb: Number((mem.external / 1024 / 1024).toFixed(2)),
      },
      cpu: {
        userMs: Math.round(cpu.user / 1000),
        systemMs: Math.round(cpu.system / 1000),
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async getInfraStats(): Promise<InfraStats> {
    let dbHealthy = false;
    let redisHealthy = false;

    try {
      dbHealthy = await checkDatabaseHealth();
    } catch {
      dbHealthy = false;
    }

    try {
      redisHealthy = await checkRedisHealth();
    } catch {
      redisHealthy = false;
    }

    return {
      database: {
        status: dbHealthy ? "HEALTHY" : "UNHEALTHY",
        healthy: dbHealthy,
      },
      redis: {
        status: redisHealthy ? "HEALTHY" : "UNHEALTHY",
        healthy: redisHealthy,
      },
      metrics: {
        totalHttpRequests: metrics.getHttpRequestsTotal(),
        activeConnections: 0,
      },
    };
  }

  public async getBusinessStats(): Promise<BusinessStats> {
    try {
      const now = new Date();
      const [bookingsResult] = await db.select({ value: count() }).from(bookings);
      const [moviesResult] = await db.select({ value: count() }).from(movies);
      const [showsResult] = await db.select({ value: count() }).from(shows);
      const [seatHoldsResult] = await db
        .select({ value: count() })
        .from(seatLocks)
        .where(gt(seatLocks.expiresAt, now));

      return {
        totalBookings: Number(bookingsResult?.value ?? 0),
        totalMovies: Number(moviesResult?.value ?? 0),
        activeShows: Number(showsResult?.value ?? 0),
        activeSeatHolds: Number(seatHoldsResult?.value ?? 0),
      };
    } catch {
      return {
        totalBookings: 0,
        totalMovies: 0,
        activeShows: 0,
        activeSeatHolds: 0,
      };
    }
  }

  public async getComprehensiveStats(): Promise<ComprehensiveStats> {
    const system = this.getSystemStats();
    const infra = await this.getInfraStats();
    const business = await this.getBusinessStats();

    return {
      system,
      infra,
      business,
    };
  }
}

export const statsService = new StatsService();
