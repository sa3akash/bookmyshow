import { db } from "@/infrastructure/database/client";
import { outboxEvents } from "@/infrastructure/database/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { publishRealtimeEvent, BroadcastEventType } from "@/infrastructure/redis/pubsub";
import { eventBus } from "@/core/events/event-bus";
import { DomainEvent } from "@/core/events/domain-events";
import { logger } from "@/core/observability/logger";

export interface OutboxEnqueueDTO {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  availableAt?: Date;
}

export class OutboxProcessor {
  private isRunning = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Enqueue outbox event INSIDE THE SAME PostgreSQL TRANSACTION as entity creation/mutation
   */
  async enqueueOutboxEvent(tx: any, dto: OutboxEnqueueDTO) {
    const [inserted] = await tx
      .insert(outboxEvents)
      .values({
        eventType: dto.eventType,
        aggregateType: dto.aggregateType,
        aggregateId: dto.aggregateId,
        payload: dto.payload,
        status: "PENDING",
        retryCount: 0,
        availableAt: dto.availableAt || new Date(),
      })
      .returning();

    logger.debug({ outboxId: inserted?.id, eventType: dto.eventType }, "Transactional outbox event enqueued");
    return inserted;
  }

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

      // 1. Broadcast to Typed Domain Event Bus
      await eventBus.publish({
        specVersion: "1.0",
        eventType: event.eventType as any,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventId: event.id,
        timestamp: event.createdAt.toISOString(),
        payload: payload as any,
      });

      // 2. Broadcast to WebSockets via Redis Pub/Sub channels
      if (payload.showId) {
        await publishRealtimeEvent(`show:${payload.showId}`, eventType, payload);
      }

      if (payload.bookingId || event.aggregateId) {
        const bookingId = (payload.bookingId || event.aggregateId) as string;
        await publishRealtimeEvent(`booking:${bookingId}`, eventType, payload);
      }

      if (payload.userId) {
        await publishRealtimeEvent(`user:${payload.userId}`, eventType, payload);
      }

      await publishRealtimeEvent("admin", eventType, { ...payload, aggregateId: event.aggregateId });

      // Mark outbox event as PROCESSED
      await db
        .update(outboxEvents)
        .set({
          status: "PROCESSED",
          processedAt: new Date(),
        })
        .where(eq(outboxEvents.id, event.id));

      logger.debug({ eventId: event.id, eventType: event.eventType }, "Dispatched outbox event to EventBus & Redis Pub/Sub");
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
