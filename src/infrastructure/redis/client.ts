import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";

export const redis = new Redis(env.REDIS_URL, {
  keyPrefix: env.REDIS_KEY_PREFIX,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ times, delay }, "Retrying Redis connection...");
    return delay;
  },
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis Client Error");
});

redis.on("connect", () => {
  logger.info("Connected to Redis server");
});

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const ping = await redis.ping();
    return ping === "PONG";
  } catch (err) {
    logger.error({ err }, "Redis health check failed");
    return false;
  }
}
