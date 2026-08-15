import { Elysia, t } from "elysia";
import { bookingService } from "../service/booking.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const bookingController = new Elysia({ prefix: "/api/v1/bookings" })
  .post(
    "/",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;
      
      const result = await bookingService.holdSeats({
        userId: user.userId,
        showId: body.showId,
        seatIds: body.seatIds,
        couponCode: body.couponCode,
        idempotencyKey,
      });
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        showId: t.String(),
        seatIds: t.Array(t.String(), { minItems: 1, maxItems: 10 }),
        couponCode: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Bookings"],
        summary: "Reserve temporary seat hold (5 min TTL) and initiate booking (supports Idempotency-Key)",
      },
    }
  )
  .post(
    "/hold",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;
      const result = await bookingService.holdSeats({
        userId: user.userId,
        showId: body.showId,
        seatIds: body.seatIds,
        couponCode: body.couponCode,
        idempotencyKey,
      });
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        showId: t.String(),
        seatIds: t.Array(t.String(), { minItems: 1, maxItems: 10 }),
        couponCode: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Bookings"],
        summary: "Reserve temporary seat hold (5 min TTL) and initiate booking (supports Idempotency-Key)",
      },
    }
  )
  .post(
    "/atomic",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const idempotencyKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key") || undefined;
      const result = await bookingService.createBookingAtomic({
        userId: user.userId,
        showId: body.showId,
        seatIds: body.seatIds,
        couponCode: body.couponCode,
        providerName: body.providerName,
        idempotencyKey,
      });
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        showId: t.String(),
        seatIds: t.Array(t.String(), { minItems: 1, maxItems: 10 }),
        couponCode: t.Optional(t.String()),
        providerName: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Bookings"],
        summary: "Single-transaction atomic seat reservation, booking creation, and payment intent generation",
      },
    }
  )
  .get(
    "/:bookingId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const booking = await bookingService.getBooking(params.bookingId, user.userId);
      return successResponse(booking, undefined, requestId);
    },
    {
      params: t.Object({ bookingId: t.String() }),
      detail: { tags: ["Bookings"], summary: "Get booking details by ID" },
    }
  )
  .post(
    "/:bookingId/cancel",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await bookingService.cancelBooking(params.bookingId, user.userId);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ bookingId: t.String() }),
      detail: { tags: ["Bookings"], summary: "Cancel unconfirmed booking and release seats" },
    }
  );
