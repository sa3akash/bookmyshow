import { Elysia, t } from "elysia";
import { paymentService } from "../service/payment.service";
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
        body.provider || "MOCK",
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
