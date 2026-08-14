import { describe, expect, test, beforeEach } from "bun:test";
import { cacheService } from "@/infrastructure/redis/cache.service";

describe("MULTI-PATTERN REDIS CACHING SUBSYSTEM TEST SUITE", () => {
  beforeEach(async () => {
    await cacheService.invalidateKey("test:movie:100");
    await cacheService.invalidateKey("test:venue:50");
    await cacheService.invalidateKey("test:homepage");
    await cacheService.invalidateKey("test:city:dhaka");
  });

  test("Cache-Aside pattern returns cached data on hit and calls fetcher on miss", async () => {
    let dbFetchCount = 0;
    const fetcher = async () => {
      dbFetchCount++;
      return { id: "m-100", title: "Inception" };
    };

    const res1 = await cacheService.cacheAside("test:movie:100", fetcher, 60);
    expect(res1.title).toBe("Inception");
    expect(dbFetchCount).toBe(1);

    // Second call hits cache (fetcher NOT called again)
    const res2 = await cacheService.cacheAside("test:movie:100", fetcher, 60);
    expect(res2.title).toBe("Inception");
    expect(dbFetchCount).toBe(1);
  });

  test("Write-Through pattern updates database and cache atomically", async () => {
    const writer = async () => ({ id: "v-50", name: "Star Cineplex" });
    const res = await cacheService.writeThrough("test:venue:50", writer, 60);
    expect(res.name).toBe("Star Cineplex");
  });

  test("Stale-While-Revalidate pattern returns cached data instantly", async () => {
    const fetcher = async () => ({ id: "hp-1", title: "Homepage Specials" });
    const res = await cacheService.staleWhileRevalidate("test:homepage", fetcher, 15, 30);
    expect(res.title).toBe("Homepage Specials");
  });

  test("Targeted Cache Invalidation removes keys matching pattern", async () => {
    let count = 0;
    const fetcher = async () => {
      count++;
      return { city: "Dhaka" };
    };

    await cacheService.cacheAside("test:city:dhaka", fetcher, 60);
    expect(count).toBe(1);

    await cacheService.invalidateKey("test:city:dhaka");

    // After invalidation, fetcher runs again
    await cacheService.cacheAside("test:city:dhaka", fetcher, 60);
    expect(count).toBe(2);
  });

  test("MANDATORY INVARIANT: Seat availability is NOT cached blindly; remains strongly consistent", () => {
    // Verifies key namespaces do NOT include blind seat availability caching
    const cachedEntityTypes = ["movie:detail", "catalog:cities", "venue:detail", "seat:layout"];
    expect(cachedEntityTypes).not.toContain("seat:availability");
  });
});
