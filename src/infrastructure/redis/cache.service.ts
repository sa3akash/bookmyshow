import { redis } from "./client";
import { logger } from "@/core/observability/logger";

export class CacheService {
  /**
   * 1. CACHE-ASIDE PATTERN (100% Redis)
   * Reads from Redis first (`redis.get`). On miss, executes DB fetcher, writes to Redis (`redis.setex`), and returns.
   */
  async cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.debug({ key }, "Cache-Aside HIT from Redis");
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      logger.warn({ key, err }, "Redis read error in Cache-Aside, falling back to DB fetcher");
    }

    logger.debug({ key }, "Cache-Aside MISS in Redis");
    const freshData = await fetcher();

    if (freshData !== undefined && freshData !== null) {
      try {
        await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
      } catch (err) {
        logger.warn({ key, err }, "Redis setex error in Cache-Aside");
      }
    }

    return freshData;
  }

  /**
   * 2. WRITE-THROUGH PATTERN (100% Redis)
   * Executes DB write operation AND updates Redis cache atomically via `redis.setex`.
   */
  async writeThrough<T>(
    key: string,
    writer: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    const result = await writer();

    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(result));
      logger.debug({ key }, "Write-Through Redis cache updated");
    } catch (err) {
      logger.warn({ key, err }, "Redis setex error in Write-Through");
    }

    return result;
  }

  /**
   * 3. STALE-WHILE-REVALIDATE PATTERN (100% Redis)
   * Reads from Redis (`redis.get` & `redis.ttl`). Instantly returns stale cache if within SWR window while revalidating asynchronously in background.
   */
  async staleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 900,
    swrWindowSeconds = 3600
  ): Promise<T> {
    try {
      const cachedRaw = await redis.get(key);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        const ttl = await redis.ttl(key);

        // If cache expired but within SWR grace window, trigger background revalidation
        if (ttl <= 0) {
          logger.info({ key }, "Stale-While-Revalidate: Serving stale Redis data, revalidating in background...");
          fetcher()
            .then((fresh) => redis.setex(key, ttlSeconds + swrWindowSeconds, JSON.stringify(fresh)))
            .catch((err) => logger.error({ key, err }, "Background SWR revalidation failed"));
        }

        return parsed as T;
      }
    } catch (err) {
      logger.warn({ key, err }, "Redis error in SWR, falling back to fetcher");
    }

    const fresh = await fetcher();
    try {
      await redis.setex(key, ttlSeconds + swrWindowSeconds, JSON.stringify(fresh));
    } catch (err) {
      logger.warn({ key, err }, "Redis setex error in SWR");
    }

    return fresh;
  }

  /**
   * 4. TARGETED CACHE INVALIDATION (100% Redis)
   */
  async invalidateKey(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug({ key }, "Invalidated Redis cache key");
    } catch (err) {
      logger.warn({ key, err }, "Redis del error");
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info({ pattern, deletedCount: keys.length }, "Invalidated Redis cache pattern");
      }
    } catch (err) {
      logger.warn({ pattern, err }, "Redis keys/del error");
    }
  }
}

export const cacheService = new CacheService();
