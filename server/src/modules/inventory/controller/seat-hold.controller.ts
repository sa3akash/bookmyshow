import { Elysia, t } from "elysia";
import { seatLockService } from "@/modules/inventory/seat-lock.service";
import { seatHoldReconcilerService } from "@/modules/inventory/seat-hold-reconciler.service";
import { successResponse } from "@/core/types/api-response";

export const seatHoldController = new Elysia({ prefix: "/seats/hold" })
  /**
   * Temporary Seat Hold Reservation (5-minute TTL)
   */
  .post(
    "/",
    async ({ body }) => {
      const userId = body.userId || "00000000-0000-0000-0000-000000000001";

      const lockResult = await seatLockService.lockSeats({
        showId: body.showId,
        seatIds: body.seatIds,
        userId,
      });

      return successResponse(
        {
          holdId: lockResult.holdId,
          showId: lockResult.showId,
          seatIds: lockResult.seatIds,
          userId: lockResult.userId,
          status: lockResult.status,
          totalAmountMinor: lockResult.totalAmountMinor,
          expiresAt: lockResult.expiresAt.toISOString(),
          holdDurationSeconds: 300,
          seatDetails: lockResult.seatDetails,
        },
        { message: "Seats held successfully for 5 minutes" }
      );
    },
    {
      body: t.Object({
        showId: t.String(),
        seatIds: t.Array(t.String()),
        userId: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Inventory & Seat Hold"],
        summary: "Reserve seats temporarily with 5-minute expiration",
      },
    }
  )

  /**
   * Get Hold Status & Remaining TTL
   */
  .get(
    "/:holdId",
    async ({ params }) => {
      const hold = await seatLockService.getHoldStatus(params.holdId);
      return successResponse(hold, { message: "Retrieved seat hold status" });
    },
    {
      params: t.Object({
        holdId: t.String(),
      }),
      detail: {
        tags: ["Inventory & Seat Hold"],
        summary: "Get temporary seat hold status and remaining TTL",
      },
    }
  )

  /**
   * Release Seat Hold Early
   */
  .delete(
    "/:holdId",
    async ({ params }) => {
      await seatLockService.releaseHold(params.holdId);
      return successResponse({ holdId: params.holdId, status: "RELEASED" }, { message: "Seat hold released successfully" });
    },
    {
      params: t.Object({
        holdId: t.String(),
      }),
      detail: {
        tags: ["Inventory & Seat Hold"],
        summary: "Release temporary seat hold early",
      },
    }
  )

  /**
   * Manually Trigger Background Reconciliation Job
   */
  .post(
    "/reconcile",
    async () => {
      const result = await seatHoldReconcilerService.runReconciliation();
      return successResponse(result, { message: "Completed seat hold reconciliation cycle" });
    },
    {
      detail: {
        tags: ["Inventory & Seat Hold"],
        summary: "Trigger background seat hold reconciliation job",
      },
    }
  );
