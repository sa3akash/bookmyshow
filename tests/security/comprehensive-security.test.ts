import { describe, expect, test } from "bun:test";
import { SSRFProtection } from "@/infrastructure/security/ssrf-protection";
import { accountLockoutService } from "@/infrastructure/security/account-lockout.service";
import { app } from "@/app/app";

describe("COMPREHENSIVE SECURITY SUBSYSTEM TEST SUITE", () => {
  test("HTTP responses include Helmet-equivalent security headers", async () => {
    const response = await app.handle(
      new Request("http://localhost/health/live", { method: "GET" })
    );

    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("strict-transport-security")).toContain("max-age=31536000");
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
  });

  test("SSRFProtection blocks internal IP ranges (127.0.0.1, 10.0.0.1, AWS 169.254.169.254)", () => {
    expect(() => SSRFProtection.validateOutboundUrl("http://127.0.0.1/admin")).toThrow();
    expect(() => SSRFProtection.validateOutboundUrl("http://localhost:8080/internal")).toThrow();
    expect(() => SSRFProtection.validateOutboundUrl("http://169.254.169.254/latest/meta-data/")).toThrow();
    expect(() => SSRFProtection.validateOutboundUrl("http://10.0.0.15/secret")).toThrow();

    // Valid public URL passes
    expect(() => SSRFProtection.validateOutboundUrl("https://api.stripe.com/v1/charges")).not.toThrow();
  });

  test("AccountLockoutService tracks consecutive failed attempts and locks account", async () => {
    const testEmail = "victim-lockout@example.com";
    await accountLockoutService.resetAttempts(testEmail);

    let attempts = 0;
    for (let i = 0; i < 4; i++) {
      attempts = await accountLockoutService.recordFailedAttempt(testEmail);
    }
    expect(attempts).toBe(4);

    // 5th attempt triggers lockout exception
    expect(accountLockoutService.recordFailedAttempt(testEmail)).rejects.toThrow();

    // Subsequent check verifies account is locked
    expect(accountLockoutService.checkLockout(testEmail)).rejects.toThrow();

    await accountLockoutService.resetAttempts(testEmail);
  });
});
