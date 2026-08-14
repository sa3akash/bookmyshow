import { Elysia } from "elysia";
import { captchaService } from "./captcha.service";
import { botDetector } from "./bot-detector";
import { logger } from "@/core/observability/logger";

export const botProtectionPlugin = new Elysia({ name: "bot-protection" })
  .onBeforeHandle({ as: "global" }, async ({ request, headers }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const clientIp =
      headers["cf-connecting-ip"] ||
      headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const turnstileToken = headers["x-turnstile-token"];
    const recaptchaToken = headers["x-recaptcha-token"];

    // 1. Protect High-Risk Seat Booking / Holding (/api/v1/bookings/hold or /shows/)
    if (method === "POST" && (path.includes("/bookings/hold") || path.includes("/shows/"))) {
      logger.info({ clientIp, path }, "Enforcing Bot Shield on Seat Hold endpoint");
      await botDetector.enforceBotProtection(headers, clientIp);
      await botDetector.checkActionVelocity("seat_hold", clientIp, 10, 5); // Max 5 seat holds per 10 seconds
      if (turnstileToken || recaptchaToken) {
        await captchaService.validateRequestCaptcha({ turnstileToken, recaptchaToken, remoteIp: clientIp });
      }
    }

    // 2. Protect Popular Movie Creation Releases (/api/v1/movies)
    if (method === "POST" && path === "/api/v1/movies") {
      await botDetector.enforceBotProtection(headers, clientIp);
    }

    // 3. Protect OTP Verification & Authentication (/api/v1/auth/login, /api/v1/auth/verify-otp)
    if (method === "POST" && (path.includes("/auth/login") || path.includes("/auth/verify-otp"))) {
      await botDetector.checkActionVelocity("otp_auth", clientIp, 60, 5); // Max 5 login attempts per minute
      if (turnstileToken || recaptchaToken) {
        await captchaService.validateRequestCaptcha({ turnstileToken, recaptchaToken, remoteIp: clientIp });
      }
    }

    // 4. Protect Coupon Code Abuse (/api/v1/coupons/apply)
    if (method === "POST" && path.includes("/coupons/apply")) {
      await botDetector.checkActionVelocity("coupon_apply", clientIp, 60, 3); // Max 3 coupon trial attempts per minute
    }

    // 5. Protect Payment Intent Endpoints (/api/v1/payments/intent)
    if (method === "POST" && path.includes("/payments/intent")) {
      await botDetector.enforceBotProtection(headers, clientIp);
      await botDetector.checkActionVelocity("payment_intent", clientIp, 30, 3); // Max 3 payment intents per 30 sec
    }
  });
