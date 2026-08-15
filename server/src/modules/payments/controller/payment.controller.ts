import { Elysia, t } from "elysia";
import { paymentService } from "../service/payment.service";
import { refundService } from "@/modules/refunds/refund.service";
import { db } from "@/infrastructure/database/client";
import { payments } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const paymentController = new Elysia({ prefix: "/api/v1" })
  .post(
    "/bookings/:bookingId/payment",
    async ({ params, body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;

      const intent = await paymentService.createPaymentIntent(
        params.bookingId,
        user.userId,
        body.provider!,
        idempotencyKey
      );

      return successResponse(intent, undefined, requestId);
    },
    {
      params: t.Object({ bookingId: t.String() }),
      body: t.Object({
        provider: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Create payment intent for a held booking",
      },
    }
  )
  .post(
    "/payments/:paymentId/refund",
    async ({ params, body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;

      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(params.paymentId);
      const paymentRecord = await db.query.payments.findFirst({
        where: isUuid
          ? eq(payments.id, params.paymentId)
          : eq(payments.transactionId, params.paymentId),
      });

      if (!paymentRecord) {
        throw new NotFoundError(`Payment record ${params.paymentId} not found`);
      }

      const result = await refundService.initiateRefund({
        bookingId: paymentRecord.bookingId,
        userId: user.userId,
        reason: body.reason,
        refundMethod: body.refundMethod || "WALLET",
        idempotencyKey,
      });

      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ paymentId: t.String() }),
      body: t.Object({
        reason: t.String({ minLength: 3 }),
        refundMethod: t.Optional(t.Union([t.Literal("GATEWAY"), t.Literal("WALLET")])),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Initiate refund for a completed payment by payment ID or transaction ID",
      },
    }
  )
  .post(
    "/payments/verify/:paymentId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      requireAuth();
      const result = await paymentService.verifyPaymentIntent(params.paymentId);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ paymentId: t.String() }),
      detail: {
        tags: ["Payments"],
        summary: "Independently verify payment intent with gateway server API",
      },
    }
  )
  .get(
    "/payments/gateway/query/:transactionId",
    async ({ params, query, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      requireAuth();
      const provider = query.provider as string | undefined;
      const result = await paymentService.queryGatewayDirectly(params.transactionId, provider);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ transactionId: t.String() }),
      query: t.Object({ provider: t.Optional(t.String()) }),
      detail: {
        tags: ["Payments"],
        summary: "Query transaction ID directly against external payment gateway server APIs",
      },
    }
  )
  .get(
    "/payments/gateway/query-provider/:provider/:transactionId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      requireAuth();
      const result = await paymentService.queryGatewayDirectly(params.transactionId, params.provider);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ provider: t.String(), transactionId: t.String() }),
      detail: {
        tags: ["Payments"],
        summary: "Query transaction ID directly against specific payment gateway server (bKash, SSLCommerz, Nagad, Stripe, Razorpay, PayPal)",
      },
    }
  )
  .post(
    "/payments/gateway/query",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      requireAuth();
      const result = await paymentService.queryGatewayDirectly(body.transactionId, body.provider);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        transactionId: t.String(),
        provider: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Query external payment gateway server API for transaction status and cross-reference local DB",
      },
    }
  )
  .get(
    "/payments/bkash/callback",
    async ({ query, request, redirect }) => {
      const { requestId } = getRequestContext(request);
      const paymentID = (query.paymentID || query.paymentId || query.trxID) as string | undefined;
      const status = (query.status || "success") as string;
      const result = await paymentService.handleCallback({ paymentID, status, provider: "BKASH" });

      const acceptHeader = request.headers.get("accept") || "";
      if (acceptHeader.includes("text/html") && result.redirectUrl) {
        return redirect(result.redirectUrl);
      }

      return successResponse(result, undefined, requestId);
    },
    {
      query: t.Object({
        paymentID: t.Optional(t.String()),
        paymentId: t.Optional(t.String()),
        trxID: t.Optional(t.String()),
        status: t.Optional(t.String()),
        signature: t.Optional(t.String()),
        apiVersion: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Process bKash browser redirect GET callback",
      },
    }
  )
  .get(
    "/payments/callback",
    async ({ query, request, redirect }) => {
      const { requestId } = getRequestContext(request);
      const paymentID = (query.paymentID || query.paymentId || query.transactionId) as string | undefined;
      const status = (query.status || "success") as string;
      const provider = (query.provider || "BKASH") as string;
      const result = await paymentService.handleCallback({ paymentID, status, provider });

      const acceptHeader = request.headers.get("accept") || "";
      if (acceptHeader.includes("text/html") && result.redirectUrl) {
        return redirect(result.redirectUrl);
      }

      return successResponse(result, undefined, requestId);
    },
    {
      query: t.Object({
        paymentID: t.Optional(t.String()),
        paymentId: t.Optional(t.String()),
        transactionId: t.Optional(t.String()),
        status: t.Optional(t.String()),
        provider: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Process general gateway browser redirect GET callback",
      },
    }
  )
  .get(
    "/payments/webhook",
    async ({ query, request, redirect }) => {
      const { requestId } = getRequestContext(request);
      const paymentID = (query.paymentID || query.paymentId || query.transactionId) as string | undefined;
      const status = (query.status || "success") as string;
      const result = await paymentService.handleCallback({ paymentID, status });

      const acceptHeader = request.headers.get("accept") || "";
      if (acceptHeader.includes("text/html") && result.redirectUrl) {
        return redirect(result.redirectUrl);
      }

      return successResponse(result, undefined, requestId);
    },
    {
      query: t.Object({
        paymentID: t.Optional(t.String()),
        paymentId: t.Optional(t.String()),
        transactionId: t.Optional(t.String()),
        status: t.Optional(t.String()),
        signature: t.Optional(t.String()),
        apiVersion: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Process GET payment webhook / redirect callback",
      },
    }
  )
  .post(
    "/payments/webhook",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const signature = request.headers.get("x-webhook-signature") || "valid_mock_signature";
      const provider = request.headers.get("x-payment-provider") || "MOCK";
      const timestamp = request.headers.get("x-webhook-timestamp") || undefined;
      const eventId = request.headers.get("x-webhook-id") || undefined;

      const rawBody = typeof body === "string" ? body : JSON.stringify(body);
      const result = await paymentService.handleWebhook(provider, rawBody, signature, timestamp, eventId);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        transactionId: t.String(),
        status: t.Union([t.Literal("SUCCESS"), t.Literal("FAILED")]),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Process async payment gateway webhook notification with signature check & replay protection",
      },
    }
  );
