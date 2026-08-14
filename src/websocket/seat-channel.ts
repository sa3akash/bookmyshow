import { Elysia } from "elysia";
import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/core/observability/logger";

export const wsController = new Elysia({ prefix: "/ws" })
  .ws("/shows/:showId", {
    open(ws) {
      const showId = ws.data.params.showId;
      logger.info({ showId }, "WebSocket client connected for show seat map updates");

      // Subscribe to Redis Pub/Sub channel for this show
      const subClient = new Redis(env.REDIS_URL, { keyPrefix: env.REDIS_KEY_PREFIX });
      const channel = `events:show:${showId}`;

      subClient.subscribe(channel, (err) => {
        if (err) {
          logger.error({ err, showId }, "Failed to subscribe to Redis show channel");
        }
      });

      subClient.on("message", (_chan, message) => {
        try {
          ws.send(JSON.parse(message));
        } catch {
          ws.send(message);
        }
      });

      // Attach subClient to ws instance for cleanup on close
      (ws.data as unknown as Record<string, unknown>).subClient = subClient;
    },
    close(ws) {
      const showId = ws.data.params.showId;
      logger.info({ showId }, "WebSocket client disconnected");
      const subClient = (ws.data as unknown as Record<string, unknown>).subClient as Redis | undefined;
      if (subClient) {
        subClient.unsubscribe();
        subClient.quit();
      }
    },
    message(ws, message) {
      // Echo heartbeat or client ping
      ws.send({ event: "pong", clientTime: message });
    },
  });
