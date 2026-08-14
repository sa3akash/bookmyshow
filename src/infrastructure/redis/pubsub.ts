import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";

export type BroadcastEventType =
  | "seat.held"
  | "seat.released"
  | "seat.booked"
  | "booking.updated"
  | "payment.updated";

export interface RealtimeEventPayload {
  type: BroadcastEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export const publisherClient = new Redis(env.REDIS_URL, {
  keyPrefix: env.REDIS_KEY_PREFIX,
  lazyConnect: true,
});

export async function publishRealtimeEvent(channel: string, type: BroadcastEventType, payload: Record<string, unknown>) {
  try {
    const event: RealtimeEventPayload = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    await publisherClient.publish(channel, JSON.stringify(event));
    logger.debug({ channel, type }, "Published real-time event to Redis channel");
  } catch (err) {
    logger.error({ err, channel, type }, "Failed to publish real-time event to Redis");
  }
}
