import { db } from "@/infrastructure/database/client";
import { users, movies, venues, bookings, payments, seatLocks } from "@/infrastructure/database/schema";
import { eq, sum, count, gte, and, lte } from "drizzle-orm";
import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";

export class AdminService {
  async getDashboardMetrics() {
    const totalUsersCount = await db.select({ val: count() }).from(users);
    const totalMoviesCount = await db.select({ val: count() }).from(movies);
    const totalVenuesCount = await db.select({ val: count() }).from(venues);
    const totalBookingsCount = await db.select({ val: count() }).from(bookings);

    const revenueResult = await db
      .select({ total: sum(bookings.finalAmountMinor) })
      .from(bookings)
      .where(eq(bookings.status, "TICKET_ISSUED"));

    const totalRevenueMinor = revenueResult[0]?.total ? Number(revenueResult[0].total) : 0;

    return {
      totalUsers: Number(totalUsersCount[0]?.val || 0),
      totalMovies: Number(totalMoviesCount[0]?.val || 0),
      totalVenues: Number(totalVenuesCount[0]?.val || 0),
      totalBookings: Number(totalBookingsCount[0]?.val || 0),
      totalRevenueMinor,
      totalRevenueBDT: totalRevenueMinor / 100,
    };
  }

  /**
   * Reconciliation Job: Finds expired seat locks and releases dangling seats safely in DB & Redis
   */
  async reconcileExpiredSeatHolds() {
    const now = new Date();
    const expiredLocks = await db
      .select()
      .from(seatLocks)
      .where(and(eq(seatLocks.status, "HELD"), lte(seatLocks.expiresAt, now)));

    if (expiredLocks.length === 0) {
      return { reconciledCount: 0 };
    }

    const expiredHoldIds = Array.from(new Set(expiredLocks.map((l) => l.holdId)));

    await db
      .update(seatLocks)
      .set({ status: "EXPIRED" })
      .where(and(eq(seatLocks.status, "HELD"), lte(seatLocks.expiresAt, now)));

    // Clean up corresponding Redis keys
    const redisKeys = expiredLocks.map((l) => `seat-lock:${l.showId}:${l.seatId}`);
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys);
    }

    logger.info({ reconciledCount: expiredLocks.length, expiredHoldIds }, "Reconciled expired seat holds");

    return { reconciledCount: expiredLocks.length };
  }
}

export const adminService = new AdminService();
