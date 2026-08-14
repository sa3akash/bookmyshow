import { describe, expect, test } from "bun:test";
import { rateLimiter } from "@/infrastructure/security/rate-limiter";
import { app } from "@/app/app";

describe("DISTRIBUTED RATE LIMITING SUBSYSTEM TEST SUITE", () => {
  test("evaluates IP-based rate limiting for search tier", async () => {
    const result = await rateLimiter.checkRateLimit("search", "ip:192.168.1.50");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(60);
    expect(result.remaining).toBeLessThanOrEqual(60);
  });

  test("evaluates strict rate limiting for login tier", async () => {
    const testIp = "test-login-ip-100";
    let lastResult;
    for (let i = 0; i < 6; i++) {
      lastResult = await rateLimiter.checkRateLimit("login", testIp, { maxRequests: 5, windowSeconds: 60 });
    }
    expect(lastResult?.allowed).toBe(false);
    expect(lastResult?.remaining).toBe(0);
  });

  test("HTTP app response includes rate limit headers", async () => {
    const response = await app.handle(
      new Request("http://localhost/health/live", { method: "GET" })
    );

    expect(response.headers.get("x-ratelimit-limit")).toBeDefined();
    expect(response.headers.get("x-ratelimit-remaining")).toBeDefined();
    expect(response.headers.get("x-ratelimit-reset")).toBeDefined();
  });
});
