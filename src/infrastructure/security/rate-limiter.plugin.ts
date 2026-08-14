import { Elysia } from "elysia";
import { rateLimiter, RateLimitCategory } from "./rate-limiter";

export const rateLimiterPlugin = new Elysia({ name: "rate-limiter" })
  .onBeforeHandle({ as: "global" }, async ({ request, headers, set }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. Determine Identifier Dimensions: IP, User, Token, Endpoint
    const clientIp =
      headers["cf-connecting-ip"] ||
      headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const authHeader = headers["authorization"];
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const apiKey = headers["x-api-key"];

    // 2. Select Target Category & Identifier
    let category: RateLimitCategory = "api";
    let identifierKey = `ip:${clientIp}`;

    if (path.includes("/auth/login")) {
      category = "login";
      identifierKey = `ip:${clientIp}`;
    } else if (path.includes("/auth/verify-otp") || path.includes("/auth/otp")) {
      category = "otp";
      identifierKey = `ip:${clientIp}`;
    } else if (path.includes("/payments/")) {
      category = "payment";
      identifierKey = bearerToken ? `token:${bearerToken.slice(-16)}` : `ip:${clientIp}`;
    } else if (path.includes("/bookings/")) {
      category = "booking";
      identifierKey = bearerToken ? `token:${bearerToken.slice(-16)}` : `ip:${clientIp}`;
    } else if (path.includes("/search")) {
      category = "search";
      identifierKey = `ip:${clientIp}`;
    } else if (path.includes("/admin/")) {
      category = "admin";
      identifierKey = bearerToken ? `token:${bearerToken.slice(-16)}` : `ip:${clientIp}`;
    } else if (path.includes("/webhooks/")) {
      category = "webhook";
      identifierKey = apiKey ? `key:${apiKey}` : `ip:${clientIp}`;
    }

    // 3. Enforce Rate Limit and Set RateLimit Response Headers
    const result = await rateLimiter.enforce(category, identifierKey);

    set.headers["X-RateLimit-Limit"] = String(result.limit);
    set.headers["X-RateLimit-Remaining"] = String(result.remaining);
    set.headers["X-RateLimit-Reset"] = String(result.resetSeconds);
  });
