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

  test("GET /api/v1/stats returns comprehensive monitoring payload", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.system.runtime).toBeDefined();
    expect(json.data.infra.database.status).toBeDefined();
    expect(json.data.business.totalBookings).toBeGreaterThanOrEqual(0);
  });

  test("GET /api/v1/stats/system returns process runtime details", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats/system"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.memory.heapTotalMb).toBeGreaterThan(0);
  });

  test("GET /api/v1/stats/infra returns infrastructure health status", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats/infra"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.database.healthy).toBeDefined();
  });

  test("GET /api/v1/stats/business returns catalog and reservation counters", async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/stats/business"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.totalMovies).toBeGreaterThanOrEqual(0);
  });

  test("GraphQL Query stats fetches monitoring statistics via /graphql", async () => {
    const body = JSON.stringify({
      query: `
        query {
          stats {
            system {
              runtime
              uptimeHuman
            }
            infra {
              database { status healthy }
              redis { status healthy }
            }
            business {
              totalBookings
              totalMovies
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
    expect(json.data.stats.system.runtime).toBeDefined();
    expect(json.data.stats.infra.database.status).toBeDefined();
  });
});
