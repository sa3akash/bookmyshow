import { describe, expect, test } from "bun:test";
import { app } from "@/app/app";
import { KPIEngine } from "@/modules/analytics/domain/services/kpi.engine";
import { MovieScoringEngine } from "@/modules/analytics/domain/services/scoring.engine";
import { analyticsRepository } from "@/modules/analytics/infrastructure/repositories/analytics.repository";
import { statsAggregator } from "@/modules/analytics/infrastructure/aggregators/stats.aggregator";
import { projectionRebuilder } from "@/modules/analytics/infrastructure/projections/projection.rebuilder";
import { funnelService } from "@/modules/analytics/application/services/funnel.service";
import { exportService } from "@/modules/analytics/application/services/export.service";
import { PrivacySanitizer } from "@/modules/analytics/domain/services/privacy.sanitizer";
import { generateAccessToken } from "@/modules/auth/domain/jwt";

describe("ADVANCED ANALYTICS & BUSINESS INTELLIGENCE TEST SUITE", () => {
  test("KPIEngine calculates accurate KPI metrics and formulas", () => {
    expect(KPIEngine.calculateOccupancyRate(78, 100)).toBe(78.0);
    expect(KPIEngine.calculateBookingConversion(80, 100)).toBe(80.0);
    expect(KPIEngine.calculatePaymentSuccessRate(98, 100)).toBe(98.0);
    expect(KPIEngine.calculateAverageOrderValue(50000, 10)).toBe(5000);
    expect(KPIEngine.calculateRefundRate(5, 100)).toBe(5.0);
    expect(KPIEngine.calculateScreenUtilization(4, 5)).toBe(80.0);

    const comp = KPIEngine.calculateComparison(120, 100);
    expect(comp.change).toBe(20);
    expect(comp.percentage).toBe(20.0);
    expect(comp.trend).toBe("UP");
  });

  test("MovieScoringEngine computes dynamic score with custom weightings", () => {
    const defaultEngine = new MovieScoringEngine();
    const score1 = defaultEngine.calculateScore({
      views: 1000,
      bookings: 500,
      revenueMinor: 10000000,
      occupancyRate: 80,
      rating: 9,
      growthRate: 20,
    });
    expect(score1).toBeGreaterThan(0);

    const customEngine = new MovieScoringEngine({
      viewsWeight: 0.1,
      bookingsWeight: 0.2,
      revenueWeight: 0.5, // 50% weight on revenue
      occupancyWeight: 0.1,
      ratingWeight: 0.05,
      growthWeight: 0.05,
    });
    const score2 = customEngine.calculateScore({
      views: 1000,
      bookings: 500,
      revenueMinor: 10000000,
      occupancyRate: 80,
      rating: 9,
      growthRate: 20,
    });
    expect(score2).toBeGreaterThan(0);
  });

  test("AnalyticsRepository records append-only event stream", async () => {
    const id = await analyticsRepository.insertEvent({
      eventName: "movie_view",
      userId: "u-test-1",
      platform: "WEB",
      city: "Dhaka",
    });
    expect(id).toBeDefined();

    const count = await analyticsRepository.getEventsCount("movie_view");
    expect(count).toBeGreaterThan(0);
  });

  test("StatsAggregator computes daily stats and stores precomputed Redis cache", async () => {
    await statsAggregator.aggregateDailyStats("2026-08-15");
    const cached = await statsAggregator.getCachedPrecomputedOverview();
    expect(cached).toBeDefined();
    expect(cached?.todayBookings).toBe(120);
  });

  test("ProjectionRebuilder rebuilds projection tables from event stream", async () => {
    const results = await projectionRebuilder.rebuildAllProjections();
    expect(results.length).toBe(4);
    if (results[0]) {
      expect(results[0].status).toBe("SUCCESS");
    }
  });

  test("FunnelService generates 10-stage booking conversion funnel", async () => {
    await analyticsRepository.insertEvent({ eventName: "show_view" });
    await analyticsRepository.insertEvent({ eventName: "ticket_issued" });

    const funnel = await funnelService.getBookingFunnel();
    expect(funnel.length).toBe(10);
    if (funnel[0] && funnel[9]) {
      expect(funnel[0].stage).toBe("movie_view");
      expect(funnel[9].stage).toBe("ticket_issued");
    }
  });

  test("PrivacySanitizer redacts PII, passwords, OTPs, and payment credentials", () => {
    const rawMetadata = {
      userIp: "192.168.1.1",
      passwordHash: "secret_hash_123",
      otpCode: "987654",
      creditCardNumber: "4111111111111111",
      bookingRef: "BK-10023",
    };
    const sanitized = PrivacySanitizer.sanitizeMetadata(rawMetadata);
    expect(sanitized.passwordHash).toBe("[REDACTED_PII]");
    expect(sanitized.otpCode).toBe("[REDACTED_PII]");
    expect(sanitized.creditCardNumber).toBe("[REDACTED_PII]");
    expect(sanitized.bookingRef).toBe("BK-10023");
  });

  test("ExportService triggers asynchronous export job and generates report content", async () => {
    const job = await exportService.triggerAsyncExport("revenue-report", "CSV");
    expect(job.jobId).toBeDefined();
    expect(job.status).toBe("COMPLETED");

    const content = exportService.generateExportContent("revenue-report", "CSV");
    expect(content).toContain("date,gmvMinor");
  });

  test("GET /api/v1/admin/stats/overview returns overview payload for SUPER_ADMIN", async () => {
    const token = generateAccessToken({
      userId: "u-admin",
      email: "admin@example.com",
      roles: ["SUPER_ADMIN"],
      permissions: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/overview", {
        headers: { authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.users.total).toBeGreaterThan(0);
  });

  test("GET /api/v1/admin/stats/revenue blocks unauthorized user lacking analytics:financial permission", async () => {
    const token = generateAccessToken({
      userId: "u-cust",
      email: "cust@example.com",
      roles: ["CUSTOMER"],
      permissions: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/revenue", {
        headers: { authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(403);
  });

  test("GET /api/v1/admin/stats/funnel returns conversion rates for authorized ADMIN", async () => {
    const token = generateAccessToken({
      userId: "u-admin",
      email: "admin@example.com",
      roles: ["ADMIN"],
      permissions: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/funnel", {
        headers: { authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data[0].stage).toBe("movie_view");
  });

  test("POST /api/v1/admin/stats/export triggers async export job for FINANCE_MANAGER", async () => {
    const token = generateAccessToken({
      userId: "u-finance",
      email: "finance@example.com",
      roles: ["FINANCE_MANAGER"],
      permissions: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/export", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          reportType: "daily-revenue",
          format: "CSV",
        }),
      })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.jobId).toBeDefined();
  });

  test("GET & POST /api/v1/admin/stats/scoring-weights dynamically configures movie performance scoring weights", async () => {
    const token = generateAccessToken({
      userId: "u-admin",
      email: "admin@example.com",
      roles: ["ADMIN"],
      permissions: [],
    });

    const getRes = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/scoring-weights", {
        headers: { authorization: `Bearer ${token}` },
      })
    );
    expect(getRes.status).toBe(200);

    const postRes = await app.handle(
      new Request("http://localhost/api/v1/admin/stats/scoring-weights", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          viewsWeight: 0.20,
          revenueWeight: 0.40,
        }),
      })
    );
    expect(postRes.status).toBe(200);
    const json = await postRes.json();
    expect(json.data.revenueWeight).toBe(0.40);
  });
});
