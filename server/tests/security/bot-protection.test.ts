import { describe, expect, test } from "bun:test";
import { captchaService } from "@/infrastructure/security/captcha.service";
import { botDetector } from "@/infrastructure/security/bot-detector";
import { app } from "@/app/app";

describe("BOT / ABUSE PROTECTION SUBSYSTEM TEST SUITE", () => {
  test("CaptchaService verifies Cloudflare Turnstile test token", async () => {
    const isTurnstileValid = await captchaService.verifyTurnstile("test-turnstile-token-pass");
    expect(isTurnstileValid).toBe(true);
  });

  test("CaptchaService verifies Google reCAPTCHA v3 test token", async () => {
    const isRecaptchaValid = await captchaService.verifyRecaptcha("test-recaptcha-token-pass");
    expect(isRecaptchaValid).toBe(true);
  });

  test("BotDetector flags automated Headless Chrome User-Agent", async () => {
    const assessment = await botDetector.assessRisk(
      { "user-agent": "Mozilla/5.0 HeadlessChrome/100.0" },
      "192.168.1.10"
    );
    expect(assessment.score).toBeGreaterThanOrEqual(60);
    expect(assessment.reasons.some((r) => r.includes("headlesschrome"))).toBe(true);
  });

  test("BotDetector evaluates valid human request headers with device fingerprint", async () => {
    const assessment = await botDetector.assessRisk(
      {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "x-device-fingerprint": "a1b2c3d4e5f6g7h8i9j0",
        "cf-ray": "7a8b9c1d2e3f4g5h",
      },
      "127.0.0.1"
    );
    expect(assessment.score).toBe(0);
    expect(assessment.isBlocked).toBe(false);
  });

  test("Protected seat hold endpoint rejects requests from blocked bots", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/bookings/hold", {
        method: "POST",
        headers: {
          "user-agent": "Puppeteer/5.0 (Bot Scraper)",
          "content-type": "application/json",
        },
        body: JSON.stringify({ showId: "show-101", seatIds: ["seat-1"] }),
      })
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });
});
