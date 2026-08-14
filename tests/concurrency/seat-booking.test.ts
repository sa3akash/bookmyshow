import { describe, expect, test, mock } from "bun:test";
import { SeatLockService } from "@/modules/inventory/seat-lock.service";
import { SeatUnavailableError } from "@/core/errors/app-error";

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
      findFirst: async () => ({ id: "show-123", screenId: "screen-123", basePriceMinor: 50000 }),
    },
    seats: {
      findMany: async () => [
        { id: "seat-1", screenId: "screen-123", priceMultiplier: "1.00", seatNumber: "A1" },
        { id: "seat-2", screenId: "screen-123", priceMultiplier: "1.00", seatNumber: "A2" },
      ],
    },
  },
  select: () => ({
    from: () => mockChain,
  }),
  insert: () => ({
    values: async () => [],
  }),
};

mock.module("@/infrastructure/database/client", () => ({
  db: {
    transaction: async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
  },
}));

describe("MANDATORY CONCURRENCY TEST: High-Volume Seat Allocation", () => {
  test("1,000 concurrent requests attempting to hold the EXACT SAME seats must result in exactly 1 success and 999 failures", async () => {
    const seatLockService = new SeatLockService();
    const showId = crypto.randomUUID();
    const targetSeatIds = ["seat-1", "seat-2"];
    const totalConcurrentRequests = 1000;

    // Simulate 1,000 parallel reservation requests
    const promises = Array.from({ length: totalConcurrentRequests }).map((_, index) => {
      const userId = crypto.randomUUID();
      return seatLockService.lockSeats({
        showId,
        seatIds: targetSeatIds,
        userId,
      });
    });

    const results = await Promise.allSettled(promises);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    console.log(`[CONCURRENCY VERIFICATION] Total Requests: ${totalConcurrentRequests}`);
    console.log(`[CONCURRENCY VERIFICATION] Successful Holds: ${fulfilled.length}`);
    console.log(`[CONCURRENCY VERIFICATION] Prevented Double-Bookings: ${rejected.length}`);

    // VERIFICATION ASSERTIONS
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(totalConcurrentRequests - 1);

    // Verify rejection reasons
    for (const rej of rejected) {
      if (rej.status === "rejected") {
        expect(rej.reason).toBeInstanceOf(SeatUnavailableError);
      }
    }
  });
});
