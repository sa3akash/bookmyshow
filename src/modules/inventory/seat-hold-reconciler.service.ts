import { db } from "@/infrastructure/database/client";
import { seatLocks, bookings, outboxEvents } from "@/infrastructure/database/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";

export interface ReconciliationResult {
  reconciledHoldsCount: number;
  expiredBookingsCount: number;
  releasedSeatsCount: number;
  expiredHoldIds: string[];
}

export class SeatHoldReconcilerService {
  private isRunning = false;

  /**
   * Run background reconciliation job:
   * Scans PostgreSQL for expired seat holds (expiresAt <= NOW()) that are still status = 'HELD',
   * updates DB records, cleans up Redis locks, and broadcasts real-time WebSocket updates.
   */
  async runReconciliation(): Promise<ReconciliationResult> {
    if (this.isRunning) {
      logger.debug("Seat hold reconciliation is already in progress, skipping run");
      return { reconciledHoldsCount: 0, expiredBookingsCount: 0, releasedSeatsCount: 0, expiredHoldIds: [] };
    }

    this.isRunning = true;
    try {
      const now = new Date();

      // 1. Query all seat_locks that have expired and are still status = 'HELD'
      let expiredLocks: typeof seatLocks.$inferSelect[] = [];
      try {
        expiredLocks = await db
          .select()
          .from(seatLocks)
          .where(and(eq(seatLocks.status, "HELD"), lte(seatLocks.expiresAt, now)));
      } catch (err) {
        logger.warn({ err }, "Database seat_locks query warning in reconciler job");
      }

      if (expiredLocks.length === 0) {
        return { reconciledHoldsCount: 0, expiredBookingsCount: 0, releasedSeatsCount: 0, expiredHoldIds: [] };
      }

      const expiredHoldIds = Array.from(new Set(expiredLocks.map((l) => l.holdId)));
      const affectedShowIds = Array.from(new Set(expiredLocks.map((l) => l.showId)));

      // 2. Perform ACID atomic database update & outbox event insertion
      const result = await db.transaction(async (tx) => {
        // Mark seat_locks as EXPIRED
        await tx
          .update(seatLocks)
          .set({ status: "EXPIRED" })
          .where(and(eq(seatLocks.status, "HELD"), lte(seatLocks.expiresAt, now)));

        // Find and mark associated bookings as EXPIRED if status is still SEATS_HELD or PAYMENT_PENDING
        const expiredBookings = await tx
          .select({ id: bookings.id, userId: bookings.userId, showId: bookings.showId })
          .from(bookings)
          .where(
            and(
              inArray(bookings.holdId, expiredHoldIds),
              inArray(bookings.status, ["SEATS_HELD", "PAYMENT_PENDING"])
            )
          );

        if (expiredBookings.length > 0) {
          const expiredBookingIds = expiredBookings.map((b) => b.id);
          await tx
            .update(bookings)
            .set({ status: "EXPIRED", updatedAt: now })
            .where(inArray(bookings.id, expiredBookingIds));

          // Insert outbox events for expired bookings
          for (const b of expiredBookings) {
            await tx.insert(outboxEvents).values({
              eventType: "booking.expired.v1",
              aggregateType: "booking",
              aggregateId: b.id,
              payload: {
                bookingId: b.id,
                userId: b.userId,
                showId: b.showId,
                reason: "Seat hold expiration timeout",
                expiredAt: now.toISOString(),
              },
            });
          }
        }

        // Insert seat.hold_expired.v1 events
        for (const holdId of expiredHoldIds) {
          const holdSeats = expiredLocks.filter((l) => l.holdId === holdId);
          if (holdSeats.length > 0 && holdSeats[0]) {
            await tx.insert(outboxEvents).values({
              eventType: "seat.hold_expired.v1",
              aggregateType: "seat_hold",
              aggregateId: holdId,
              payload: {
                holdId,
                showId: holdSeats[0].showId,
                seatIds: holdSeats.map((s) => s.seatId),
                userId: holdSeats[0].userId,
                expiredAt: now.toISOString(),
              },
            });
          }
        }

        return {
          reconciledHoldsCount: expiredHoldIds.length,
          expiredBookingsCount: expiredBookings.length,
          releasedSeatsCount: expiredLocks.length,
          expiredHoldIds,
        };
      });

      // 3. Clean up Redis keys safely
      const redisKeysToDelete: string[] = [];
      for (const lock of expiredLocks) {
        redisKeysToDelete.push(`seat-lock:${lock.showId}:${lock.seatId}`);
      }
      for (const holdId of expiredHoldIds) {
        redisKeysToDelete.push(`hold:${holdId}`);
      }

      if (redisKeysToDelete.length > 0) {
        await redis.del(...redisKeysToDelete);
      }

      // 4. Broadcast Pub/Sub updates to affected show channels
      for (const showId of affectedShowIds) {
        const showReleasedSeats = expiredLocks.filter((l) => l.showId === showId).map((l) => l.seatId);
        try {
          await redis.publish(
            `show:${showId}`,
            JSON.stringify({
              type: "seat.released",
              showId,
              releasedSeatIds: showReleasedSeats,
              reason: "HOLD_EXPIRED",
            })
          );
        } catch (err) {
          logger.warn({ showId, err }, "Failed to publish seat.released event to Redis channel");
        }
      }

      logger.info(
        {
          reconciledHoldsCount: result.reconciledHoldsCount,
          expiredBookingsCount: result.expiredBookingsCount,
          releasedSeatsCount: result.releasedSeatsCount,
        },
        "Completed temporary seat hold background reconciliation"
      );

      return result;
    } catch (err) {
      logger.error({ err }, "Error running seat hold reconciliation job");
      throw err;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start periodic background reconciler worker
   */
  startWorker(intervalMs: number = 10000): Timer {
    logger.info({ intervalMs }, "Starting background seat hold reconciliation worker");
    return setInterval(() => {
      this.runReconciliation().catch((err) => {
        logger.error({ err }, "Background seat hold reconciler cycle failed");
      });
    }, intervalMs);
  }
}

export const seatHoldReconcilerService = new SeatHoldReconcilerService();
