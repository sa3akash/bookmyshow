import { Elysia } from "elysia";
import { analyticsService } from "../application/services/analytics.service";
import { funnelService } from "../application/services/funnel.service";
import { exportService } from "../application/services/export.service";
import { movieScoringEngine } from "../domain/services/scoring.engine";
import { KPIEngine } from "../domain/services/kpi.engine";
import { projectionRebuilder } from "../infrastructure/projections/projection.rebuilder";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";
import { chartQuerySchema, exportRequestSchema } from "./analytics.schemas";

export const analyticsController = new Elysia({ prefix: "/api/v1/admin/stats" })
  .get(
    "/overview",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const overview = await analyticsService.getOverviewStats();
      return successResponse(overview, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get unified dashboard overview metrics" },
    }
  )
  .get(
    "/realtime",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const realtimeData = await analyticsService.getRealtimeDashboardStats();
      return successResponse(realtimeData, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get real-time dashboard metrics (active users, current bookings, payments, seat holds, confirmed bookings, rates, revenue today)" },
    }
  )
  .get(
    "/realtime/sse",
    async ({ request }) => {
      const { requirePermission } = getRequestContext(request);
      requirePermission("analytics:read");
      const realtimeData = await analyticsService.getRealtimeDashboardStats();

      return new Response(`data: ${JSON.stringify(realtimeData)}\n\n`, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    },
    {
      detail: { tags: ["Analytics"], summary: "Server-Sent Events (SSE) stream for real-time dashboard statistics" },
    }
  )
  .get(
    "/users",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:users");
      const data = await analyticsService.getUserStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get user acquisition, active user and retention stats" },
    }
  )
  .get(
    "/bookings",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getBookingStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get booking attempts, success, failure, cancellation, and expiration rates" },
    }
  )
  .get(
    "/venues",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getVenueStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get venue performance metrics" },
    }
  )
  .get(
    "/screens",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getScreenStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get screen utilization and capacity metrics" },
    }
  )
  .get(
    "/screens/:screenId",
    async ({ params, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getScreenStats(params.screenId);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get specific screen utilization and capacity metrics by screenId" },
    }
  )
  .get(
    "/shows",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getShowStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get showtimes occupancy, financial and conversion metrics" },
    }
  )
  .get(
    "/shows/:showId",
    async ({ params, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getShowStats(params.showId);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get detailed showtime stats by showId" },
    }
  )
  .get(
    "/seats",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getSeatOverviewStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get seat state counters and seat category occupancy/revenue metrics" },
    }
  )
  .get(
    "/seats/demand",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getSeatDemandAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get seat demand over 5m/15m/30m/1h/6h/24h time windows & high/low demand seat/show identification" },
    }
  )
  .get(
    "/scoring-weights",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:movies");
      const weights = movieScoringEngine.getWeighting();
      return successResponse(weights, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get current configurable movie performance scoring weights" },
    }
  )
  .post(
    "/scoring-weights",
    async ({ request, body }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:movies");
      const newWeights = movieScoringEngine.setWeighting(body as any);
      return successResponse(newWeights, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Configure custom movie performance scoring metric weights" },
    }
  )
  .get(
    "/revenue",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:financial");
      const period = (query as any)?.period ?? "daily";
      const startDate = (query as any)?.startDate;
      const endDate = (query as any)?.endDate;
      const data = await analyticsService.getRevenueStats(period, startDate, endDate);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get detailed auditable financial revenue breakdown and fee structure" },
    }
  )
  .get(
    "/finance",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:financial");
      const data = await analyticsService.getFinanceLedgerStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get finance ledger metrics, pending/completed settlements, liabilities and reconciliation state" },
    }
  )
  .get(
    "/payments",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:payments");
      const data = await analyticsService.getPaymentStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get payment attempt, method, provider and success rate metrics" },
    }
  )
  .get(
    "/payments/providers",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:payments");
      const data = await analyticsService.getPaymentProviderStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get payment provider health, latency, timeout and degradation statistics" },
    }
  )
  .get(
    "/refunds",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:financial");
      const data = await analyticsService.getRefundStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get refund requests, processing status, average processing time, and breakdowns by movie, venue, show, provider, reason and date" },
    }
  )
  .get(
    "/coupons",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getCouponStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get coupon views, applications, redemptions, discount volume, ROI and rankings" },
    }
  )
  .get(
    "/campaigns",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getCampaignStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get offer & campaign impressions, views, clicks, applications, redemptions, revenue, cost and ROI" },
    }
  )
  .get(
    "/cities",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getCityStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get city-wise user, venue, screen, show, ticket, revenue and occupancy rankings" },
    }
  )
  .get(
    "/search",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getSearchAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get search query analytics, zero-result searches, autocomplete selections and conversion rates" },
    }
  )
  .get(
    "/behavior",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getBehaviorAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get user behavior events breakdown (APP_OPENED, MOVIE_VIEWED, SEAT_SELECTED, etc.)" },
    }
  )
  .get(
    "/sessions",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getSessionAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get session counts, average session duration, pages viewed and session-to-booking conversion" },
    }
  )
  .get(
    "/devices",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getDevicePlatformAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get platform (Android, iOS, Web) and device (mobile, tablet, desktop) performance breakdown" },
    }
  )
  .get(
    "/languages",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getLanguageStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get language-wise bookings, revenue, occupancy, views and average ratings" },
    }
  )
  .get(
    "/genres",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getGenreStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get genre-wise views, bookings, revenue, occupancy, ratings and growth" },
    }
  )
  .get(
    "/time-based",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const timeframe = (query as any)?.timeframe ?? "today";
      const startDate = (query as any)?.startDate;
      const endDate = (query as any)?.endDate;
      const data = await analyticsService.getTimeBasedAnalytics(timeframe, startDate, endDate);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get time-window based analytics (today, yesterday, last_7_days, last_30_days, this_month, custom_range)" },
    }
  )
  .get(
    "/hourly",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getHourlyAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get 24-hour hourly traffic, bookings, revenue and peak booking hours" },
    }
  )
  .get(
    "/day-of-week",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getDayOfWeekAnalytics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get day-of-week (Mon-Sun) average bookings, revenue, and occupancy comparisons" },
    }
  )
  .get(
    "/funnel",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await funnelService.getBookingFunnel();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get 10-stage booking conversion funnel analytics" },
    }
  )
  .get(
    "/revenue/chart",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:financial");
      const period = (query as any)?.period ?? "daily";
      const data = await analyticsService.getChartData("revenue", period);
      return successResponse(data, undefined, requestId);
    },
    {
      query: chartQuerySchema,
      detail: { tags: ["Analytics"], summary: "Get time-series revenue chart data" },
    }
  )
  .get(
    "/bookings/chart",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const period = (query as any)?.period ?? "daily";
      const data = await analyticsService.getChartData("bookings", period);
      return successResponse(data, undefined, requestId);
    },
    {
      query: chartQuerySchema,
      detail: { tags: ["Analytics"], summary: "Get time-series booking chart data" },
    }
  )
  .get(
    "/users/chart",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:users");
      const period = (query as any)?.period ?? "daily";
      const data = await analyticsService.getChartData("users", period);
      return successResponse(data, undefined, requestId);
    },
    {
      query: chartQuerySchema,
      detail: { tags: ["Analytics"], summary: "Get time-series user growth chart data" },
    }
  )
  .get(
    "/occupancy/chart",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const period = (query as any)?.period ?? "daily";
      const data = await analyticsService.getChartData("occupancy", period);
      return successResponse(data, undefined, requestId);
    },
    {
      query: chartQuerySchema,
      detail: { tags: ["Analytics"], summary: "Get time-series occupancy chart data" },
    }
  )
  .get(
    "/top/movies",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:movies");
      const sortBy = (query as any)?.sortBy ?? "revenue";
      const data = await analyticsService.getTopPerformers("movies", sortBy);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get top grossing movies ranking" },
    }
  )
  .get(
    "/top/venues",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const sortBy = (query as any)?.sortBy ?? "revenue";
      const data = await analyticsService.getTopPerformers("venues", sortBy);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get top performing venues ranking" },
    }
  )
  .get(
    "/top/cities",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const sortBy = (query as any)?.sortBy ?? "revenue";
      const data = await analyticsService.getTopPerformers("cities", sortBy);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get top performing cities ranking" },
    }
  )
  .get(
    "/top/shows",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const sortBy = (query as any)?.sortBy ?? "revenue";
      const data = await analyticsService.getTopPerformers("shows", sortBy);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get top performing shows ranking" },
    }
  )
  .get(
    "/top/coupons",
    async ({ request, query }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const sortBy = (query as any)?.sortBy ?? "revenue";
      const data = await analyticsService.getTopPerformers("coupons", sortBy);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get top performing coupons ranking" },
    }
  )
  .get(
    "/top/screens",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:venues");
      const data = await analyticsService.getTopScreens();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get best performing screen utilization ranking" },
    }
  )
  .get(
    "/comparison",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getComparisonStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get period-over-period comparison metrics (current vs previous, change, percentage, trend)" },
    }
  )
  .get(
    "/operational",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getOperationalMetrics();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get operational latencies and engine health metrics" },
    }
  )
  .get(
    "/booking-engine",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getBookingEngineStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get critical production metrics for seat locking, holds, expirations, and transaction conflicts" },
    }
  )
  .get(
    "/queues",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getQueueStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get background queue depth, processing latency, throughput, failure rates and lag alerts" },
    }
  )
  .get(
    "/search-engine",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getSearchEngineStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get OpenSearch search latency, errors, indexing latency, failures and index lag" },
    }
  )
  .get(
    "/notifications",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getNotificationStats();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get email, SMS, and push notification provider delivery rates, bounce, and failure statistics" },
    }
  )
  .get(
    "/kpis",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const kpis = KPIEngine.getKPIDefinitions();
      return successResponse(kpis, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get authoritative business KPI definitions, formulas, data sources, and aggregation rules" },
    }
  )
  .get(
    "/reports/scheduled",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:reports");
      const data = await analyticsService.getScheduledReports();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "List scheduled sales, revenue, performance, payment, refund, and coupon reports" },
    }
  )
  .post(
    "/reports/scheduled/:id/run",
    async ({ params, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:reports");
      const data = await analyticsService.triggerReportExecution(params.id);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Manually trigger immediate execution of a scheduled report" },
    }
  )
  .get(
    "/alerts/thresholds",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.getAlertingThresholds();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get configurable operational alert threshold configurations" },
    }
  )
  .post(
    "/alerts/thresholds",
    async ({ body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const { alertType, threshold, isEnabled } = body as any;
      const data = await analyticsService.updateAlertingThreshold(alertType, threshold, isEnabled);
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Update operational alert threshold configuration" },
    }
  )
  .get(
    "/alerts/active",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.evaluateActiveAlerts();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Get currently active operational alerts exceeding configured thresholds" },
    }
  )
  .get(
    "/anomalies",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const data = await analyticsService.runAnomalyDetectionScan();
      return successResponse(data, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Run statistical Z-Score anomaly detection scan for booking, refund, payment, coupon, revenue, and traffic anomalies" },
    }
  )
  .post(
    "/export",
    async ({ request, body }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:export");
      const payload = body as { reportType: string; format?: "CSV" | "JSON" };
      const job = await exportService.triggerAsyncExport(payload.reportType, payload.format);
      return successResponse(job, undefined, requestId);
    },
    {
      body: exportRequestSchema,
      detail: { tags: ["Analytics"], summary: "Trigger asynchronous report data export" },
    }
  )
  .get(
    "/export/download/:jobId",
    async ({ params, set }) => {
      const jobIdWithExt = params.jobId;
      const [jobId, format] = jobIdWithExt.split(".");
      const exportFormat = format?.toUpperCase() === "JSON" ? "JSON" : "CSV";
      const content = exportService.generateExportContent("report", exportFormat);

      if (exportFormat === "JSON") {
        set.headers["content-type"] = "application/json";
      } else {
        set.headers["content-type"] = "text/csv";
        set.headers["content-disposition"] = `attachment; filename="${jobId}.csv"`;
      }

      return content;
    },
    {
      detail: { tags: ["Analytics"], summary: "Download generated asynchronous export file" },
    }
  )
  .post(
    "/rebuild",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("analytics:read");
      const results = await projectionRebuilder.rebuildAllProjections();
      return successResponse(results, undefined, requestId);
    },
    {
      detail: { tags: ["Analytics"], summary: "Trigger background projection rebuild from event log" },
    }
  );
