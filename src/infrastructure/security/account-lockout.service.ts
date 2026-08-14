import { redis } from "@/infrastructure/redis/client";
import { ForbiddenError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { env } from "@/config/env";

const inMemoryLockStore = new Map<string, { attempts: number; lockedUntil?: number }>();

export class AccountLockoutService {
  private maxFailedAttempts = 5;
  private lockoutDurationSeconds = 900; // 15 minutes lockout

  /**
   * Check if account is locked out
   */
  async checkLockout(email: string): Promise<void> {
    const lockKey = `account:locked:${email.toLowerCase()}`;

    // In-memory fallback for test environment
    if (env.NODE_ENV === "test") {
      const record = inMemoryLockStore.get(email.toLowerCase());
      if (record && record.lockedUntil && record.lockedUntil > Date.now()) {
        const ttl = Math.ceil((record.lockedUntil - Date.now()) / 1000);
        throw new ForbiddenError(`Account is temporarily locked due to excessive failed login attempts. Retry in ${ttl} seconds.`);
      }
      return;
    }

    try {
      const isLocked = await redis.get(lockKey);
      if (isLocked) {
        const ttl = await redis.ttl(lockKey);
        throw new ForbiddenError(`Account is temporarily locked due to excessive failed login attempts. Retry in ${ttl} seconds.`);
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
    }
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email: string): Promise<number> {
    const key = `account:failed_attempts:${email.toLowerCase()}`;
    const lockKey = `account:locked:${email.toLowerCase()}`;

    // Test environment in-memory store
    if (env.NODE_ENV === "test") {
      const current = (inMemoryLockStore.get(email.toLowerCase())?.attempts || 0) + 1;
      inMemoryLockStore.set(email.toLowerCase(), { attempts: current });

      if (current >= this.maxFailedAttempts) {
        inMemoryLockStore.set(email.toLowerCase(), {
          attempts: current,
          lockedUntil: Date.now() + this.lockoutDurationSeconds * 1000,
        });
        throw new ForbiddenError("Account has been locked out for 15 minutes due to multiple failed login attempts.");
      }
      return current;
    }

    try {
      const attempts = await redis.incr(key);
      if (attempts === 1) {
        await redis.expire(key, 900); // 15 min window
      }

      if (attempts >= this.maxFailedAttempts) {
        await redis.setex(lockKey, this.lockoutDurationSeconds, "1");
        await redis.del(key); // Reset counter
        logger.warn({ email }, "Account locked out due to 5 consecutive failed login attempts");
        throw new ForbiddenError("Account has been locked out for 15 minutes due to multiple failed login attempts.");
      }

      return attempts;
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      return 0;
    }
  }

  /**
   * Reset failed attempts on successful login
   */
  async resetAttempts(email: string): Promise<void> {
    inMemoryLockStore.delete(email.toLowerCase());
    const key = `account:failed_attempts:${email.toLowerCase()}`;
    const lockKey = `account:locked:${email.toLowerCase()}`;
    try {
      await redis.del(key);
      await redis.del(lockKey);
    } catch {
      // Ignore Redis errors
    }
  }
}

export const accountLockoutService = new AccountLockoutService();
