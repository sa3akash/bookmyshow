import { Elysia } from "elysia";
import { statsService } from "../stats.service";
import { successResponse } from "@/core/types/api-response";

export const statsController = new Elysia({ prefix: "/api/v1/stats" })
  .get(
    "/",
    async ({ request }) => {
      const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
      const stats = await statsService.getComprehensiveStats();
      return successResponse(stats, undefined, requestId);
    },
    {
      detail: {
        tags: ["System"],
        summary: "Get comprehensive server monitoring, system runtime, infrastructure & business stats",
      },
    }
  )
  .get(
    "/system",
    ({ request }) => {
      const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
      const stats = statsService.getSystemStats();
      return successResponse(stats, undefined, requestId);
    },
    {
      detail: {
        tags: ["System"],
        summary: "Get process runtime, Bun version, memory heap and CPU usage statistics",
      },
    }
  )
  .get(
    "/infra",
    async ({ request }) => {
      const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
      const stats = await statsService.getInfraStats();
      return successResponse(stats, undefined, requestId);
    },
    {
      detail: {
        tags: ["System"],
        summary: "Get database pool, Redis cache health and active connection statistics",
      },
    }
  )
  .get(
    "/business",
    async ({ request }) => {
      const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
      const stats = await statsService.getBusinessStats();
      return successResponse(stats, undefined, requestId);
    },
    {
      detail: {
        tags: ["System"],
        summary: "Get real-time business counters (bookings, movies, active shows, seat holds)",
      },
    }
  );
