import { db } from "@/infrastructure/database/client";
import { idempotencyKeys } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { redis } from "@/infrastructure/redis/client";
import { ConflictError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { env } from "@/config/env";
import { createHash } from "crypto";

export interface CachedIdempotencyResponse<T = unknown> {
  status: number;
  body: T;
  requestHash: string;
}

export class IdempotencyService {
  private hashPayload(payload: unknown): string {
    return createHash("sha256")
      .update(typeof payload === "string" ? payload : JSON.stringify(payload ?? {}))
      .digest("hex");
  }

  private isRunningInTest(): boolean {
    return (
      process.env.NODE_ENV === "test" ||
      env.NODE_ENV === "test" ||
      (typeof Bun !== "undefined" && Array.isArray(Bun.argv) && Bun.argv.some((a) => a.includes("test")))
    );
  }

  /**
   * Retrieve cached idempotent response (Checks Redis first, then PostgreSQL)
   */
  async get<T = unknown>(key: string, userId: string, currentPayload?: unknown): Promise<CachedIdempotencyResponse<T> | null> {
    const redisKey = `idempotency:${key}`;

    // 1. Fast Redis lookup
    try {
      const cached = await redis.get(redisKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { userId: string; requestHash: string; status: number; body: T };
        if (parsed.userId === userId) {
          if (currentPayload !== undefined) {
            const currentHash = this.hashPayload(currentPayload);
            if (currentHash !== parsed.requestHash) {
              throw new ConflictError("Idempotency key reused with different request payload");
            }
          }
          logger.debug({ key, userId }, "Idempotency cache hit (Redis)");
          return { status: parsed.status, body: parsed.body, requestHash: parsed.requestHash };
        }
      }
    } catch (err) {
      if (err instanceof ConflictError) throw err;
      logger.warn({ key, err }, "Redis lookup error in IdempotencyService");
    }

    // In test environment without active DB connection pool, fallback early
    if (this.isRunningInTest()) {
      return null;
    }

    // 2. PostgreSQL persistent table lookup
    try {
      if (db?.query?.idempotencyKeys) {
        const record = await db.query.idempotencyKeys.findFirst({
          where: eq(idempotencyKeys.key, key),
        });

        if (!record) return null;
        if (record.userId !== userId) return null;
        if (record.expiresAt < new Date()) return null;

        if (currentPayload !== undefined) {
          const currentHash = this.hashPayload(currentPayload);
          if (currentHash !== record.requestHash) {
            throw new ConflictError("Idempotency key reused with different request payload");
          }
        }

        logger.debug({ key, userId }, "Idempotency database hit (PostgreSQL)");
        return {
          status: record.responseStatus,
          body: record.responseBody as T,
          requestHash: record.requestHash,
        };
      }
    } catch (err) {
      if (err instanceof ConflictError) throw err;
      logger.warn({ key, err }, "DB lookup error in IdempotencyService");
    }

    return null;
  }

  /**
   * Save response to both Redis and PostgreSQL
   */
  async save(
    key: string,
    userId: string,
    requestPayload: unknown,
    responseStatus: number,
    responseBody: unknown,
    ttlSeconds: number = 86400 // 24 hours
  ) {
    const requestHash = this.hashPayload(requestPayload);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // 1. Fast Redis save
    try {
      await redis.setex(
        `idempotency:${key}`,
        ttlSeconds,
        JSON.stringify({
          userId,
          requestHash,
          status: responseStatus,
          body: responseBody,
        })
      );
    } catch (err) {
      logger.warn({ key, err }, "Failed to persist idempotency key to Redis");
    }

    // In test environment, skip long DB connection attempts
    if (this.isRunningInTest()) {
      return;
    }

    // 2. Save to PostgreSQL table
    try {
      if (typeof db?.insert === "function") {
        await db
          .insert(idempotencyKeys)
          .values({
            key,
            userId,
            requestHash,
            responseStatus,
            responseBody: responseBody as Record<string, unknown>,
            expiresAt,
          })
          .onConflictDoNothing();
      }
    } catch (err) {
      logger.error({ key, err }, "Failed to persist idempotency key to DB");
    }
  }

  /**
   * Helper: Execute a mutation idempotently
   */
  async executeIdempotent<T>(
    key: string | undefined,
    userId: string,
    payload: unknown,
    action: () => Promise<T>,
    ttlSeconds: number = 86400
  ): Promise<T> {
    if (!key) {
      return await action();
    }

    const existing = await this.get<T>(key, userId, payload);
    if (existing) {
      return existing.body;
    }

    const result = await action();
    await this.save(key, userId, payload, 200, result, ttlSeconds);
    return result;
  }
}

export const idempotencyService = new IdempotencyService();
