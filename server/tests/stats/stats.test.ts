import { describe, expect, test } from "bun:test";
import { app } from "@/app/app";
import { statsService } from "@/modules/stats/stats.service";

describe("SERVER MONITORING & STATS SUBSYSTEM TEST SUITE", () => {
  test("statsService returns valid system runtime stats", () => {
    const stats = statsService.getSystemStats();
    expect(stats.runtime).toBeDefined();
    expect(stats.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(stats.memory.heapUsedMb).toBeGreaterThan(0);
    expect(stats.timestamp).toBeDefined();
  });

  test("statsService returns infrastructure stats", async () => {
    const stats = await statsService.getInfraStats();
    expect(stats.database).toBeDefined();
    expect(stats.redis).toBeDefined();
    expect(stats.metrics.totalHttpRequests).toBeGreaterThanOrEqual(0);
  });

  test("statsService returns business counters", async () => {
    const stats = await statsService.getBusinessStats();
    expect(stats.totalBookings).toBeGreaterThanOrEqual(0);
    expect(stats.totalMovies).toBeGreaterThanOrEqual(0);
    expect(stats.activeShows).toBeGreaterThanOrEqual(0);
    expect(stats.activeSeatHolds).toBeGreaterThanOrEqual(0);
  });

  test("statsService returns box office collection stats", async () => {
    const stats = await statsService.getBoxOfficeStats();
    expect(stats.totalGrossBoxOfficeMinor).toBeGreaterThanOrEqual(0);
    expect(stats.totalGrossBoxOfficeBDT).toBeGreaterThanOrEqual(0);
    expect(stats.topGrossingMovies).toBeDefined();
  });

  test("statsService returns financial income breakdown", async () => {
    const stats = await statsService.getIncomeStats();
    expect(stats.grossTicketSalesMinor).toBeGreaterThanOrEqual(0);
    expect(stats.platformFeeIncomeMinor).toBeGreaterThanOrEqual(0);
    expect(stats.taxCollectedMinor).toBeGreaterThanOrEqual(0);
    expect(stats.merchantPayoutsMinor).toBeGreaterThanOrEqual(0);
  });

  test("GET /api/v1/stats returns comprehensive monitoring payload", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.system.runtime).toBeDefined();
    expect(json.data.infra.database.status).toBeDefined();
    expect(json.data.business.totalBookings).toBeGreaterThanOrEqual(0);
    expect(json.data.boxOffice.totalGrossBoxOfficeBDT).toBeGreaterThanOrEqual(0);
    expect(json.data.income.platformFeeIncomeBDT).toBeGreaterThanOrEqual(0);
  });

  test("GET /api/v1/stats/boxoffice returns box office earnings and top grossing movies", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats/boxoffice"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.totalGrossBoxOfficeMinor).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(json.data.topGrossingMovies)).toBe(true);
  });

  test("GET /api/v1/stats/income returns platform fee income, tax, and merchant payout breakdown", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats/income"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.platformFeeIncomeBDT).toBeGreaterThanOrEqual(0);
    expect(json.data.merchantPayoutsBDT).toBeGreaterThanOrEqual(0);
  });

  test("GraphQL Query stats fetches boxOffice and income statistics via /graphql", async () => {
    const body = JSON.stringify({
      query: `
        query {
          stats {
            boxOffice {
              totalGrossBoxOfficeBDT
              todayBoxOfficeBDT
            }
            income {
              grossTicketSalesBDT
              platformFeeIncomeBDT
              merchantPayoutsBDT
              netPlatformIncomeBDT
            }
          }
        }
      `,
    });

    const res = await app.handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.stats.boxOffice.totalGrossBoxOfficeBDT).toBeGreaterThanOrEqual(0);
    expect(json.data.stats.income.platformFeeIncomeBDT).toBeGreaterThanOrEqual(0);
  });
});
