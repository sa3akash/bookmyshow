import { Elysia, t } from "elysia";
import { settlementService } from "./settlement.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const settlementController = new Elysia({ prefix: "/api/v1/settlements" })
  .post(
    "/generate",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const settlement = await settlementService.generateVenueSettlement(
        body.venueId,
        new Date(body.periodStart),
        new Date(body.periodEnd)
      );
      return successResponse(settlement, undefined, requestId);
    },
    {
      body: t.Object({
        venueId: t.String(),
        periodStart: t.String(),
        periodEnd: t.String(),
      }),
      detail: { tags: ["System"], summary: "Generate venue/merchant payout settlement and record ledger accounting (Admin only)" },
    }
  );
