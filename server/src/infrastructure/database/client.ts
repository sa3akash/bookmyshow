import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";
import * as schema from "./schema";

// Create postgres.js connection client with connection pool configuration
export const queryClient = postgres(env.DATABASE_URL, {
  max: env.DATABASE_MAX_CONNECTIONS,
  idle_timeout: env.DATABASE_IDLE_TIMEOUT,
  onnotice: () => {}, // Suppress notice noise in logs
});

export const db = drizzle(queryClient, { schema });

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return false;
  }
}
