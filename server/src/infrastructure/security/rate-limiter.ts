import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";
import { RateLimitError } from "@/core/errors/app-error";

export type RateLimitCategory =
  | "login"
  | "otp"
  | "search"
  | "booking"
  | "payment"
  | "api"
  | "admin"
  | "webhook";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<RateLimitCategory, RateLimitConfig> = {
  login: { maxRequests: 5, windowSeconds: 60 }, // 5 req/min
  otp: { maxRequests: 3, windowSeconds: 60 }, // 3 req/min
  payment: { maxRequests: 5, windowSeconds: 60 }, // 5 req/min
  booking: { maxRequests: 10, windowSeconds: 60 }, // 10 req/min
  search: { maxRequests: 60, windowSeconds: 60 }, // 60 req/min
  admin: { maxRequests: 30, windowSeconds: 60 }, // 30 req/min
  api: { maxRequests: 120, windowSeconds: 60 }, // 120 req/min
  webhook: { maxRequests: 300, windowSeconds: 60 }, // 300 req/min
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export class DistributedRateLimiter {
  /**
   * Evaluate Rate Limit using Redis Fixed Window Algorithm
   */
  async checkRateLimit(
    category: RateLimitCategory,
    identifierKey: string,
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const config = customConfig || RATE_LIMIT_TIERS[category];
    const key = `rl:${category}:${identifierKey}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, config.windowSeconds);
      }

      const ttl = await redis.ttl(key);
      const remaining = Math.max(0, config.maxRequests - current);
      const allowed = current <= config.maxRequests;
      const resetSeconds = ttl > 0 ? ttl : config.windowSeconds;

      if (!allowed) {
        logger.warn({ category, identifierKey, current, limit: config.maxRequests }, "Rate limit exceeded");
      }

      return {
        allowed,
        limit: config.maxRequests,
        remaining,
        resetSeconds,
      };
    } catch (err) {
      logger.error({ err, category, identifierKey }, "Error evaluating Redis rate limiter; allowing request as fallback");
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: 1,
        resetSeconds: config.windowSeconds,
      };
    }
  }

  /**
   * Enforce Rate Limit and throw RateLimitError (HTTP 429) if exceeded
   */
  async enforce(
    category: RateLimitCategory,
    identifierKey: string,
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const result = await this.checkRateLimit(category, identifierKey, customConfig);
    if (!result.allowed) {
      throw new RateLimitError(`Rate limit exceeded for ${category}. Please retry in ${result.resetSeconds} seconds.`, {
        retryAfter: result.resetSeconds,
        limit: result.limit,
      });
    }
    return result;
  }
}

export const rateLimiter = new DistributedRateLimiter();
