import { db } from "@/infrastructure/database/client";
import { outboxEvents } from "@/infrastructure/database/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { publishRealtimeEvent, BroadcastEventType } from "@/infrastructure/redis/pubsub";
import { logger } from "@/core/observability/logger";

export class OutboxProcessor {
  private isRunning = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  startWorker(pollIntervalMs = 2000) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this.processPendingEvents();
    }, pollIntervalMs);

    logger.info("Transactional Outbox Worker started");
  }

  stopWorker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info("Transactional Outbox Worker stopped");
  }

  async processPendingEvents() {
    try {
      const now = new Date();
      const pendingEvents = await db
        .select()
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.status, "PENDING"),
            lte(outboxEvents.availableAt, now)
          )
        )
        .limit(20);

      for (const event of pendingEvents) {
        await this.dispatchEvent(event);
      }
    } catch (err) {
      logger.error({ err }, "Error processing outbox events");
    }
  }

  private async dispatchEvent(event: typeof outboxEvents.$inferSelect) {
    try {
      const payload = event.payload as Record<string, unknown>;
      let eventType: BroadcastEventType = "booking.updated";

      if (event.eventType.includes("held")) eventType = "seat.held";
      else if (event.eventType.includes("released")) eventType = "seat.released";
      else if (event.eventType.includes("booked") || event.eventType.includes("confirmed")) eventType = "seat.booked";
      else if (event.eventType.includes("payment")) eventType = "payment.updated";

      // 1. Broadcast to show:{showId}
      if (payload.showId) {
        await publishRealtimeEvent(`show:${payload.showId}`, eventType, payload);
      }

      // 2. Broadcast to booking:{bookingId}
      if (payload.bookingId || event.aggregateId) {
        const bookingId = (payload.bookingId || event.aggregateId) as string;
        await publishRealtimeEvent(`booking:${bookingId}`, eventType, payload);
      }

      // 3. Broadcast to user:{userId}
      if (payload.userId) {
        await publishRealtimeEvent(`user:${payload.userId}`, eventType, payload);
      }

      // 4. Broadcast to admin
      await publishRealtimeEvent("admin", eventType, { ...payload, aggregateId: event.aggregateId });

      // Mark outbox event as PROCESSED
      await db
        .update(outboxEvents)
        .set({
          status: "PROCESSED",
          processedAt: new Date(),
        })
        .where(eq(outboxEvents.id, event.id));

      logger.debug({ eventId: event.id, eventType: event.eventType }, "Dispatched outbox event to WebSockets via Redis Pub/Sub");
    } catch (err) {
      logger.error({ err, eventId: event.id }, "Failed to dispatch outbox event");
      await db
        .update(outboxEvents)
        .set({
          retryCount: sql`retry_count + 1`,
          status: event.retryCount >= 5 ? "FAILED" : "PENDING",
        })
        .where(eq(outboxEvents.id, event.id));
    }
  }
}

export const outboxProcessor = new OutboxProcessor();
