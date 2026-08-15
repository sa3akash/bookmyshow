import { describe, expect, test } from "bun:test";
import { idempotencyService } from "@/core/idempotency/idempotency.service";
import { ConflictError } from "@/core/errors/app-error";

describe("IDEMPOTENCY SUBSYSTEM TEST SUITE", () => {
  test("Repeated requests with same key and payload return cached original response", async () => {
    let executeCount = 0;
    const testKey = "test-idem-" + Math.random().toString(36).substring(2, 10);
    const userId = "00000000-0000-0000-0000-000000000001";
    const payload = { showId: "s-101", seatIds: ["A1", "A2"] };

    const action = async () => {
      executeCount++;
      return { bookingId: "b-12345", totalBDT: 500 };
    };

    // First request executes action
    const res1 = await idempotencyService.executeIdempotent(testKey, userId, payload, action);
    expect(res1.bookingId).toBe("b-12345");
    expect(executeCount).toBe(1);

    // Second request returns cached response without re-executing action
    const res2 = await idempotencyService.executeIdempotent(testKey, userId, payload, action);
    expect(res2.bookingId).toBe("b-12345");
    expect(executeCount).toBe(1);
  });

  test("Reusing same idempotency key with different payload throws ConflictError", async () => {
    const testKey = "test-conflict-" + Math.random().toString(36).substring(2, 10);
    const userId = "00000000-0000-0000-0000-000000000001";

    const payload1 = { amount: 500 };
    const payload2 = { amount: 1000 };

    await idempotencyService.save(testKey, userId, payload1, 200, { success: true });

    let caughtError: any = null;
    try {
      await idempotencyService.get(testKey, userId, payload2);
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(ConflictError);
  });

  test("IdempotencyService returns null for non-existent or different user key", async () => {
    const res1 = await idempotencyService.get("non-existent-key-xyz", "u-1");
    expect(res1).toBeNull();
  });
});
