import { app } from "@/app/app";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";
import { outboxProcessor } from "@/infrastructure/outbox/outbox.service";
import { queryClient } from "@/infrastructure/database/client";
import { redis } from "@/infrastructure/redis/client";

// 1. Start Transactional Outbox Background Worker
outboxProcessor.startWorker();

// 2. Start Bun Elysia Server
const server = app.listen({
  port: env.PORT,
  hostname: env.HOST,
});

logger.info(`🚀 BookMyShow Backend running at http://${env.HOST}:${env.PORT}`);
logger.info(`📚 Swagger Documentation at http://${env.HOST}:${env.PORT}/swagger`);

// 3. Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

  // Stop background outbox processor
  outboxProcessor.stopWorker();

  // Close server
  try {
    server.stop();
    logger.info("HTTP Server stopped accepting new connections");
  } catch (err) {
    logger.error({ err }, "Error stopping HTTP server");
  }

  // Close Redis connection
  try {
    await redis.quit();
    logger.info("Redis connection closed");
  } catch (err) {
    logger.error({ err }, "Error closing Redis connection");
  }

  // Close Database connection pool
  try {
    await queryClient.end();
    logger.info("PostgreSQL database pool closed");
  } catch (err) {
    logger.error({ err }, "Error ending PostgreSQL pool");
  }

  logger.info("Graceful shutdown completed successfully. Exiting.");
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
