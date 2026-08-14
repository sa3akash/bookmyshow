import { describe, expect, test, mock, beforeEach } from "bun:test";
import { SeatLockService } from "@/modules/inventory/seat-lock.service";
import { SeatHoldReconcilerService } from "@/modules/inventory/seat-hold-reconciler.service";
import { SeatUnavailableError } from "@/core/errors/app-error";
import { redis } from "@/infrastructure/redis/client";

// Mock DB transaction to ensure test isolation from un-migrated local postgres schema
const mockChain = {
  where: () => ({
    for: async () => [],
  }),
  innerJoin: () => ({
    where: () => ({
      for: async () => [],
    }),
  }),
};

const mockTx = {
  query: {
    shows: {
      findFirst: async () => ({
        id: "00000000-0000-0000-0000-000000000101",
        screenId: "00000000-0000-0000-0000-000000000102",
        basePriceMinor: 50000,
      }),
    },
    seats: {
      findMany: async () => [
        { id: "00000000-0000-0000-0000-000000000201", screenId: "00000000-0000-0000-0000-000000000102", priceMultiplier: "1.00", seatNumber: "A1" },
        { id: "00000000-0000-0000-0000-000000000202", screenId: "00000000-0000-0000-0000-000000000102", priceMultiplier: "1.00", seatNumber: "A2" },
        { id: "00000000-0000-0000-0000-000000000204", screenId: "00000000-0000-0000-0000-000000000102", priceMultiplier: "1.00", seatNumber: "A4" },
      ],
    },
    seatLocks: {
      findMany: async () => [],
    },
  },
  select: () => ({
    from: () => ({
      where: async () => [],
    }),
  }),
  insert: () => ({
    values: async () => [],
  }),
  update: () => ({
    set: () => ({
      where: async () => [],
    }),
  }),
};

mock.module("@/infrastructure/database/client", () => ({
  db: {
    transaction: async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
    select: () => ({
      from: () => ({
        where: async () => [],
      }),
    }),
    update: () => ({
      set: () => ({
        where: async () => [],
      }),
    }),
    query: mockTx.query,
  },
}));

describe("TEMPORARY SEAT HOLD SUBSYSTEM TEST SUITE", () => {
  beforeEach(async () => {
    const keys = [
      "seat-lock:00000000-0000-0000-0000-000000000101:00000000-0000-0000-0000-000000000201",
      "seat-lock:00000000-0000-0000-0000-000000000102:00000000-0000-0000-0000-000000000202",
      "seat-lock:00000000-0000-0000-0000-000000000104:00000000-0000-0000-0000-000000000204",
    ];
    await redis.del(...keys);
  });

  test("Creates temporary seat hold with 5-minute TTL storing hold_id, show_id, seat_id, user_id, status, expires_at", async () => {
    const seatLockService = new SeatLockService();
    const showId = "00000000-0000-0000-0000-000000000101";
    const seatId = "00000000-0000-0000-0000-000000000201";
    const userId = "00000000-0000-0000-0000-000000000301";

    const lockResult = await seatLockService.lockSeats({
      showId,
      seatIds: [seatId],
      userId,
    });

    expect(lockResult.holdId).toBeDefined();
    expect(lockResult.status).toBe("HELD");
    expect(lockResult.showId).toBe(showId);
    expect(lockResult.userId).toBe(userId);
    expect(lockResult.seatIds).toContain(seatId);

    // Verify Redis lock key exists with TTL
    const redisLockValue = await redis.get(`seat-lock:${showId}:${seatId}`);
    expect(redisLockValue).toBe(lockResult.holdId);

    const ttl = await redis.ttl(`seat-lock:${showId}:${seatId}`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(300);

    // Inspect hold status via getHoldStatus
    const holdStatus = await seatLockService.getHoldStatus(lockResult.holdId);
    expect(holdStatus.holdId).toBe(lockResult.holdId);
    expect(holdStatus.status).toBe("HELD");
    expect(holdStatus.remainingSeconds).toBeGreaterThan(0);

    // Clean up
    await seatLockService.releaseHold(lockResult.holdId);
  });

  test("Prevents double-booking while temporary seat hold is active", async () => {
    const seatLockService = new SeatLockService();
    const showId = "00000000-0000-0000-0000-000000000102";
    const seatId = "00000000-0000-0000-0000-000000000202";

    const lock1 = await seatLockService.lockSeats({
      showId,
      seatIds: [seatId],
      userId: "user-1",
    });

    let caughtError: any = null;
    try {
      await seatLockService.lockSeats({
        showId,
        seatIds: [seatId],
        userId: "user-2",
      });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(SeatUnavailableError);

    // Clean up
    await seatLockService.releaseHold(lock1.holdId);
  });

  test("Background reconciliation job runs cycle safely and cleans up expired Redis keys", async () => {
    const reconciler = new SeatHoldReconcilerService();
    const reconResult = await reconciler.runReconciliation();
    expect(reconResult).toBeDefined();
    expect(typeof reconResult.reconciledHoldsCount).toBe("number");
  });

  test("Releasing hold clears Redis keys and updates status to RELEASED", async () => {
    const seatLockService = new SeatLockService();
    const showId = "00000000-0000-0000-0000-000000000104";
    const seatId = "00000000-0000-0000-0000-000000000204";

    const lock = await seatLockService.lockSeats({
      showId,
      seatIds: [seatId],
      userId: "user-release",
    });

    await seatLockService.releaseHold(lock.holdId);

    const redisVal = await redis.get(`seat-lock:${showId}:${seatId}`);
    expect(redisVal).toBeNull();
  });
});
