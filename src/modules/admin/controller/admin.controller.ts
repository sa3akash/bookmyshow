import { Elysia } from "elysia";
import { adminService } from "../admin.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";
import { metrics } from "@/core/observability/metrics";

export const adminController = new Elysia({ prefix: "/api/v1/admin" })
  .get(
    "/dashboard",
    async ({ request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const data = await adminService.getDashboardMetrics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["System"], summary: "Get platform administration analytics and financial revenue stats" },
    }
  )
  .post(
    "/reconcile/holds",
    async ({ request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const result = await adminService.reconcileExpiredSeatHolds();
      return successResponse(result, undefined, requestId);
    },
    {
      detail: { tags: ["System"], summary: "Manually trigger background seat hold expiration reconciliation" },
    }
  );

export const metricsController = new Elysia()
  .get("/metrics", () => {
    return metrics.getPrometheusFormat();
  });
