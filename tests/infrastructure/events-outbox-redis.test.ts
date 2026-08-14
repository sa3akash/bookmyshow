import { describe, expect, test, spyOn } from "bun:test";
import { eventBus } from "@/core/events/event-bus";
import { BookingCreatedEvent } from "@/core/events/domain-events";
import { RedisKeys, RedisTTL } from "@/infrastructure/redis/redis-keys";
import { outboxProcessor } from "@/infrastructure/outbox/outbox.service";

describe("OUTBOX, EVENT SYSTEM & REDIS ARCHITECTURE TEST SUITE", () => {
  test("TypedEventBus publishes versioned domain events to subscribed listeners", async () => {
    let receivedEvent: BookingCreatedEvent | null = null;

    const unsubscribe = eventBus.subscribe<BookingCreatedEvent>("booking.created.v1", (event) => {
      receivedEvent = event;
    });

    const eventPayload: BookingCreatedEvent = {
      specVersion: "1.0",
      eventType: "booking.created.v1",
      aggregateType: "Booking",
      aggregateId: "b-999",
      eventId: "evt-123",
      timestamp: new Date().toISOString(),
      payload: {
        bookingId: "b-999",
        userId: "u-101",
        showId: "s-555",
        seatIds: ["st-1", "st-2"],
        totalAmountMinor: 10000,
        expiresAt: new Date().toISOString(),
      },
    };

    await eventBus.publish(eventPayload);

    expect(receivedEvent).not.toBeNull();
    const event = receivedEvent as BookingCreatedEvent | null;
    expect(event?.eventType).toBe("booking.created.v1");
    expect(event?.payload.bookingId).toBe("b-999");

    unsubscribe();
  });

  test("RedisKeys generates correct namespaces and TTLs", () => {
    expect(RedisKeys.userSession("u-123")).toBe("user:u-123:session");
    expect(RedisKeys.movieDetail("m-456")).toBe("movie:m-456");
    expect(RedisKeys.showDetail("s-789")).toBe("show:s-789");
    expect(RedisKeys.showSeatsLayout("s-789")).toBe("show:s-789:seats");
    expect(RedisKeys.seatLock("s-789", "st-1")).toBe("seat-lock:s-789:st-1");
    expect(RedisKeys.bookingDetail("b-999")).toBe("booking:b-999");
    expect(RedisKeys.otpCode("sms", "01700000000")).toBe("otp:sms:01700000000");
    expect(RedisKeys.rateLimit("login", "127.0.0.1")).toBe("ratelimit:login:127.0.0.1");
    expect(RedisKeys.idempotencyKey("idem-111")).toBe("idempotency:idem-111");

    expect(RedisTTL.OTP).toBe(300);
    expect(RedisTTL.SEAT_LOCK).toBe(600);
    expect(RedisTTL.SHOWTIME).toBe(900);
  });

  test("OutboxProcessor enqueues outbox events inside transaction", async () => {
    const mockTx = {
      insert: () => ({
        values: () => ({
          returning: async () => [
            {
              id: "out-100",
              eventType: "booking.created.v1",
              aggregateType: "Booking",
              aggregateId: "b-999",
              payload: { bookingId: "b-999" },
              status: "PENDING",
            },
          ],
        }),
      }),
    };

    const inserted = await outboxProcessor.enqueueOutboxEvent(mockTx, {
      eventType: "booking.created.v1",
      aggregateType: "Booking",
      aggregateId: "b-999",
      payload: { bookingId: "b-999" },
    });

    expect(inserted.id).toBe("out-100");
    expect(inserted.eventType).toBe("booking.created.v1");
  });
});
