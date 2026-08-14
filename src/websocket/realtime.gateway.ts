import { Elysia } from "elysia";
import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";

interface WsSubscriberMeta {
  subClient: Redis;
}

const wsClientsMap = new Map<string, WsSubscriberMeta>();

function createRedisSubscriber(channel: string, onMessage: (msg: string) => void): Redis {
  const subClient = new Redis(env.REDIS_URL, {
    keyPrefix: env.REDIS_KEY_PREFIX,
  });

  subClient.subscribe(channel, (err) => {
    if (err) {
      logger.error({ err, channel }, "Failed to subscribe to Redis channel");
    } else {
      logger.info({ channel }, "Subscribed to Redis Pub/Sub channel for WebSocket client");
    }
  });

  subClient.on("message", (chan, message) => {
    onMessage(message);
  });

  return subClient;
}

export const realtimeWsController = new Elysia({ prefix: "/ws" })
  // 1. Show Channel (/ws/shows/:showId) - Real-time Seat Grid Updates (seat.held, seat.released, seat.booked)
  .ws("/shows/:showId", {
    open(ws) {
      const showId = ws.data.params.showId;
      const channel = `show:${showId}`;
      logger.info({ showId, wsId: ws.id }, "WebSocket client connected to show channel");

      const subClient = createRedisSubscriber(channel, (message) => {
        try {
          ws.send(JSON.parse(message));
        } catch {
          ws.send(message);
        }
      });

      wsClientsMap.set(ws.id, { subClient });
    },
    close(ws) {
      const meta = wsClientsMap.get(ws.id);
      if (meta) {
        meta.subClient.quit();
        wsClientsMap.delete(ws.id);
        logger.info({ wsId: ws.id }, "WebSocket show channel connection closed");
      }
    },
  })

  // 2. Booking Channel (/ws/bookings/:bookingId) - Real-time Booking State Machine Updates (booking.updated, payment.updated)
  .ws("/bookings/:bookingId", {
    open(ws) {
      const bookingId = ws.data.params.bookingId;
      const channel = `booking:${bookingId}`;
      logger.info({ bookingId, wsId: ws.id }, "WebSocket client connected to booking channel");

      const subClient = createRedisSubscriber(channel, (message) => {
        try {
          ws.send(JSON.parse(message));
        } catch {
          ws.send(message);
        }
      });

      wsClientsMap.set(ws.id, { subClient });
    },
    close(ws) {
      const meta = wsClientsMap.get(ws.id);
      if (meta) {
        meta.subClient.quit();
        wsClientsMap.delete(ws.id);
        logger.info({ wsId: ws.id }, "WebSocket booking channel connection closed");
      }
    },
  })

  // 3. User Channel (/ws/users/:userId) - User Direct Push Notifications (ticket.issued, wallet.updated)
  .ws("/users/:userId", {
    open(ws) {
      const userId = ws.data.params.userId;
      const channel = `user:${userId}`;
      logger.info({ userId, wsId: ws.id }, "WebSocket client connected to user channel");

      const subClient = createRedisSubscriber(channel, (message) => {
        try {
          ws.send(JSON.parse(message));
        } catch {
          ws.send(message);
        }
      });

      wsClientsMap.set(ws.id, { subClient });
    },
    close(ws) {
      const meta = wsClientsMap.get(ws.id);
      if (meta) {
        meta.subClient.quit();
        wsClientsMap.delete(ws.id);
        logger.info({ wsId: ws.id }, "WebSocket user channel connection closed");
      }
    },
  })

  // 4. Admin Channel (/ws/admin) - Platform Admin Operations Dashboard Channel
  .ws("/admin", {
    open(ws) {
      const channel = "admin";
      logger.info({ wsId: ws.id }, "WebSocket client connected to admin channel");

      const subClient = createRedisSubscriber(channel, (message) => {
        try {
          ws.send(JSON.parse(message));
        } catch {
          ws.send(message);
        }
      });

      wsClientsMap.set(ws.id, { subClient });
    },
    close(ws) {
      const meta = wsClientsMap.get(ws.id);
      if (meta) {
        meta.subClient.quit();
        wsClientsMap.delete(ws.id);
        logger.info({ wsId: ws.id }, "WebSocket admin channel connection closed");
      }
    },
  });
