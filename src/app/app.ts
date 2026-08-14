import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { AppError } from "@/core/errors/app-error";
import { errorResponse, successResponse } from "@/core/types/api-response";
import { logger } from "@/core/observability/logger";
import { checkDatabaseHealth } from "@/infrastructure/database/client";
import { checkRedisHealth } from "@/infrastructure/redis/client";
import { metrics } from "@/core/observability/metrics";
import { securityHeadersPlugin } from "@/infrastructure/security/security-headers.plugin";
import { botProtectionPlugin } from "@/infrastructure/security/bot-protection.plugin";
import { rateLimiterPlugin } from "@/infrastructure/security/rate-limiter.plugin";
import { apiRoutes } from "@/routes";

export const app = new Elysia()
  .use(cors())
  .use(securityHeadersPlugin)
  .use(botProtectionPlugin)
  .use(rateLimiterPlugin)
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "BookMyShow Production Backend API",
          version: "1.0.0",
          description: "High-scale, production-grade ticket booking backend engine with REST & GraphQL APIs.\n\n🚀 **Apollo GraphQL Studio Sandbox**: [Launch Apollo Studio Sandbox Explorer](https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:3000/graphql)\n\nFeatures: Movies, Live Events, Concerts, Sports, jsPDF Invoices, Bank Offers, Recommendations, Multi-Gateway Payments (bKash, Stripe, Razorpay, SSLCommerz, Nagad, Wallet), Refunds & Merchant Settlements",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter JWT token to authorize API requests"
            }
          }
        },
        security: [
          { bearerAuth: [] }
        ],
        tags: [
          { name: "Auth", description: "Authentication, Registration & JWT Session Management" },
          { name: "Movies", description: "Movies Catalog, Cast, Crew & Trailer Media Gallery" },
          { name: "Venues", description: "Cities, Venues, Screens & Dynamic Seat Grid Layouts" },
          { name: "Shows", description: "Showtimes & Real-time Seat Map Status" },
          { name: "Events", description: "Live Concerts, Stand-Up Comedy Specials, Sports Matches & Festivals" },
          { name: "Bookings", description: "High-Concurrency Seat Locking & Reservation Engine" },
          { name: "Payments", description: "Multi-Gateway Payment Intents (bKash, Stripe, Razorpay, SSLCommerz, Nagad) & Webhooks" },
          { name: "Wallet", description: "Customer Digital Wallet Balance, Top-up & Balance Payments" },
          { name: "Refunds", description: "Instant Wallet / Gateway Refund Processing" },
          { name: "Settlements", description: "Merchant & Venue Payout Accounting" },
          { name: "Tickets", description: "E-Ticket QR Code Generation, Gate Verification & jsPDF Invoice Downloads" },
          { name: "Coupons", description: "Promotional Discounts & Coupon Redemptions" },
          { name: "Offers", description: "Bank Offers & Buy-One-Get-One (BOGO) Campaigns" },
          { name: "Recommendations", description: "Popular, Trending & Genre-Matched Movie Recommendations" },
          { name: "Search", description: "Full-Text Catalog Search" },
          { name: "Reviews", description: "Movie Ratings & User Reviews" },
          { name: "GraphQL", description: "GraphQL Single-Endpoint Queries & Mutations (/graphql) — [Launch Apollo Studio Explorer](https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:3000/graphql)" },
          { name: "Admin", description: "Admin Dashboard Analytics & Seat Hold Reconciliation" },
          { name: "System", description: "Health Probes & Prometheus Metrics" },
        ],
      },
    })
  )
  .derive(({ request }) => {
    metrics.incHttpRequests();
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    const traceId = request.headers.get("x-trace-id") || crypto.randomUUID();
    const startTime = performance.now();

    return {
      requestId,
      traceId,
      startTime,
    };
  })
  .onError(({ error, set, request, requestId }) => {
    const reqId = (requestId as string) || "system";

    if (error instanceof AppError) {
      set.status = error.httpStatus;
      logger.warn({
        requestId: reqId,
        code: error.code,
        message: error.message,
        url: request.url,
      }, "Application Error");

      return errorResponse(error.code, error.message, error.metadata, reqId);
    }

    if ((error as any)?.code === "NOT_FOUND" || (error as any)?.status === 404) {
      set.status = 404;
      return errorResponse("NOT_FOUND", `Route '${new URL(request.url).pathname}' not found`, undefined, reqId);
    }

    logger.error({
      requestId: reqId,
      err: error,
      url: request.url,
    }, "Unhandled Server Error");

    set.status = 500;
    return errorResponse("INTERNAL_SERVER_ERROR", "An unexpected internal error occurred", undefined, reqId);
  })
  .get("/favicon.ico", () => new Response(null, { status: 204 }))
  .get("/health", async ({ requestId }) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = await checkRedisHealth();
    const isHealthy = dbHealthy && redisHealthy;

    return successResponse({
      status: isHealthy ? "UP" : "DEGRADED",
      services: {
        database: dbHealthy ? "UP" : "DOWN",
        redis: redisHealthy ? "UP" : "DOWN",
      },
    }, undefined, requestId);
  }, {
    detail: { tags: ["System"], summary: "Detailed System Health Check" }
  })
  .get("/health/live", ({ requestId }) => {
    return successResponse({ status: "ALIVE" }, undefined, requestId);
  }, {
    detail: { tags: ["System"], summary: "Kubernetes Liveness Probe" }
  })
  .get("/health/ready", async ({ set, requestId }) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = await checkRedisHealth();

    if (!dbHealthy || !redisHealthy) {
      set.status = 503;
      return errorResponse("SERVICE_UNAVAILABLE", "Dependencies ready check failed", {
        database: dbHealthy,
        redis: redisHealthy,
      }, requestId);
    }

    return successResponse({ status: "READY" }, undefined, requestId);
  }, {
    detail: { tags: ["System"], summary: "Kubernetes Readiness Probe" }
  })
  .use(apiRoutes);
