import { redis } from "@/infrastructure/redis/client";
import { db } from "@/infrastructure/database/client";
import { seatLocks, seats, shows, bookingSeats, bookings } from "@/infrastructure/database/schema";
import { eq, and, gte, inArray, sql } from "drizzle-orm";
import { SeatUnavailableError, NotFoundError } from "@/core/errors/app-error";
import { env } from "@/config/env";

export interface LockSeatsParams {
  showId: string;
  seatIds: string[];
  userId: string;
}

export class SeatLockService {
  /**
   * Two-Tier Atomic Seat Reservation:
   * 1. Ephemeral fast distributed lock in Redis with SET NX EX.
   * 2. ACID row-level locking in PostgreSQL (FOR UPDATE) inside a transaction.
   */
  async lockSeats(params: LockSeatsParams) {
    const { showId, seatIds, userId } = params;
    const holdId = crypto.randomUUID();
    const ttlSeconds = env.SEAT_HOLD_DURATION_SECONDS;

    // 1. Fast Redis locking (ephemeral pre-check)
    const acquiredRedisLocks: string[] = [];
    try {
      for (const seatId of seatIds) {
        const lockKey = `seat-lock:${showId}:${seatId}`;
        const acquired = await redis.set(lockKey, holdId, "EX", ttlSeconds, "NX");
        if (!acquired) {
          throw new SeatUnavailableError(`Seat ${seatId} is currently held by another user`);
        }
        acquiredRedisLocks.push(lockKey);
      }
    } catch (err) {
      // Revert acquired Redis keys if any failed
      if (acquiredRedisLocks.length > 0) {
        await redis.del(...acquiredRedisLocks);
      }
      throw err;
    }

    // 2. PostgreSQL ACID Lock Verification with FOR UPDATE
    try {
      const lockResult = await db.transaction(async (tx) => {
        // Verify show exists
        const show = await tx.query.shows.findFirst({
          where: eq(shows.id, showId),
        });
        if (!show) {
          throw new NotFoundError(`Show ${showId} not found`);
        }

        // Verify seats exist for the screen
        const targetSeats = await tx.query.seats.findMany({
          where: and(eq(seats.screenId, show.screenId), inArray(seats.id, seatIds)),
        });

        if (targetSeats.length !== seatIds.length) {
          throw new NotFoundError("One or more invalid seat IDs specified");
        }

        // Check for active seat locks in PostgreSQL (FOR UPDATE)
        const now = new Date();
        const existingLocks = await tx
          .select()
          .from(seatLocks)
          .where(
            and(
              eq(seatLocks.showId, showId),
              inArray(seatLocks.seatId, seatIds),
              eq(seatLocks.status, "HELD"),
              gte(seatLocks.expiresAt, now)
            )
          )
          .for("update");

        if (existingLocks.length > 0) {
          throw new SeatUnavailableError("One or more seats have already been locked by another user");
        }

        // Check for existing confirmed/pending bookings
        const existingBookings = await tx
          .select({ seatId: bookingSeats.seatId })
          .from(bookingSeats)
          .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
          .where(
            and(
              eq(bookings.showId, showId),
              inArray(bookingSeats.seatId, seatIds),
              inArray(bookings.status, ["CONFIRMED", "TICKET_ISSUED", "PAYMENT_PENDING"])
            )
          )
          .for("update");

        if (existingBookings.length > 0) {
          throw new SeatUnavailableError("One or more seats are already booked");
        }

        // Insert seat locks into PostgreSQL
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);

        const lockRecords = seatIds.map((seatId) => ({
          showId,
          seatId,
          userId,
          holdId,
          status: "HELD",
          expiresAt,
        }));

        await tx.insert(seatLocks).values(lockRecords);

        // Calculate total amount based on seat multipliers
        let totalAmountMinor = 0;
        const seatDetails = targetSeats.map((s) => {
          const seatPrice = Math.round(show.basePriceMinor * parseFloat(s.priceMultiplier));
          totalAmountMinor += seatPrice;
          return {
            seatId: s.id,
            seatNumber: s.seatNumber,
            priceMinor: seatPrice,
          };
        });

        return {
          holdId,
          showId,
          seatIds,
          totalAmountMinor,
          seatDetails,
          expiresAt,
        };
      });

      return lockResult;
    } catch (err) {
      // Revert Redis keys if DB transaction failed
      if (acquiredRedisLocks.length > 0) {
        await redis.del(...acquiredRedisLocks);
      }
      throw err;
    }
  }

  async releaseHold(holdId: string) {
    const lockRecords = await db.query.seatLocks.findMany({
      where: eq(seatLocks.holdId, holdId),
    });

    if (lockRecords.length > 0) {
      await db
        .update(seatLocks)
        .set({ status: "RELEASED" })
        .where(eq(seatLocks.holdId, holdId));

      const redisKeys = lockRecords.map((l) => `seat-lock:${l.showId}:${l.seatId}`);
      if (redisKeys.length > 0) {
        await redis.del(...redisKeys);
      }
    }
  }
}

export const seatLockService = new SeatLockService();
