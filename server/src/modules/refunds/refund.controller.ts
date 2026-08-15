import { Elysia, t } from "elysia";
import { refundService } from "./refund.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const refundController = new Elysia({ prefix: "/api/v1/refunds" })
  .post(
    "/",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;
      const result = await refundService.initiateRefund({
        bookingId: body.bookingId,
        userId: user.userId,
        reason: body.reason,
        refundMethod: body.refundMethod || "WALLET",
        idempotencyKey,
      });
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        bookingId: t.String(),
        reason: t.String({ minLength: 3 }),
        refundMethod: t.Optional(t.Union([t.Literal("GATEWAY"), t.Literal("WALLET")])),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Request booking refund (instant credit to wallet or payment gateway with Idempotency-Key support)",
      },
    }
  )
  .get(
    "/:refundId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const refund = await refundService.getRefund(params.refundId, user.userId);
      return successResponse(refund, undefined, requestId);
    },
    {
      params: t.Object({ refundId: t.String() }),
      detail: { tags: ["Payments"], summary: "Get refund request status by ID" },
    }
  );
