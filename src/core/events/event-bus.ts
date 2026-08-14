import { redis, createRedisSubscriber } from "@/infrastructure/redis/client";
import { DomainEvent } from "./domain-events";
import { logger } from "@/core/observability/logger";
import { env } from "@/config/env";
import type Redis from "ioredis";

type EventListener<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class TypedEventBus {
  private localListeners = new Map<string, Set<EventListener<any>>>();
  private subscriberClient: Redis | null = null;
  private subscribedChannels = new Set<string>();

  constructor() {
    // Lazily initialize Redis Pub/Sub subscriber client
    if (env.NODE_ENV !== "test") {
      try {
        this.subscriberClient = createRedisSubscriber();
        this.subscriberClient.on("message", (channel, message) => {
          this.handleRedisMessage(channel, message);
        });
      } catch (err) {
        logger.warn({ err }, "Redis subscriber initialization deferred");
      }
    }
  }

  /**
   * Distributed Subscribe: Listens for typed events across ALL horizontal backend API instances via Redis Pub/Sub
   */
  subscribe<T extends DomainEvent>(eventType: T["eventType"], listener: EventListener<T>): () => void {
    const channel = `events:${eventType}`;

    if (!this.localListeners.has(eventType)) {
      this.localListeners.set(eventType, new Set());
    }
    this.localListeners.get(eventType)!.add(listener);

    // Subscribe Redis subscriber to channel if not already listening
    if (this.subscriberClient && !this.subscribedChannels.has(channel)) {
      this.subscribedChannels.add(channel);
      this.subscriberClient.subscribe(channel).catch((err) => {
        logger.error({ channel, err }, "Failed to subscribe to Redis event channel");
      });
    }

    logger.debug({ eventType, channel }, "Subscribed listener to distributed Redis event channel");

    return () => {
      this.localListeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Distributed Publish: Broadcasts event to Redis Pub/Sub & appends to Redis Stream
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const channel = `events:${event.eventType}`;
    const payloadStr = JSON.stringify(event);

    logger.info({ eventType: event.eventType, aggregateId: event.aggregateId, channel }, "Publishing distributed domain event");

    // 1. Always execute local in-memory listeners for zero-latency local dispatch
    await this.dispatchLocal(event);

    // 2. Broadcast across distributed nodes via Redis Pub/Sub & Streams
    if (env.NODE_ENV !== "test") {
      try {
        await redis.publish(channel, payloadStr);
        // Also push to Redis Stream for persistent audit history
        await redis.xadd("stream:domain_events", "*", "eventType", event.eventType, "payload", payloadStr);
      } catch (err) {
        logger.error({ channel, err }, "Failed to publish event to Redis Pub/Sub");
      }
    }
  }

  /**
   * Internal Redis message handler triggered when another API instance publishes an event
   */
  private async handleRedisMessage(channel: string, message: string) {
    try {
      const event = JSON.parse(message) as DomainEvent;
      await this.dispatchLocal(event);
    } catch (err) {
      logger.error({ channel, err }, "Failed to parse incoming Redis Pub/Sub event message");
    }
  }

  /**
   * Dispatch event to local node listeners
   */
  private async dispatchLocal<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.localListeners.get(event.eventType);
    if (!handlers || handlers.size === 0) return;

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        logger.error({ eventType: event.eventType, err }, "Event handler execution error");
      }
    });

    await Promise.all(promises);
  }
}

export const eventBus = new TypedEventBus();
