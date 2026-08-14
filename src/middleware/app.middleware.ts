import { Elysia } from "elysia";
import { authMiddleware } from "./auth.middleware";

export const appMiddleware = new Elysia({ name: "appMiddleware" })
  .derive(({ request }) => {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    const traceId = request.headers.get("x-trace-id") || crypto.randomUUID();
    const startTime = performance.now();

    return {
      requestId,
      traceId,
      startTime,
    };
  })
  .use(authMiddleware);
