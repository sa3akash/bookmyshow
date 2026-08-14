import { Elysia, t } from "elysia";
import { offerService } from "./offer.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const offerController = new Elysia({ prefix: "/api/v1/offers" })
  .get(
    "/",
    async ({ request }) => {
      const { requestId } = getRequestContext(request);
      const activeOffers = await offerService.listActiveOffers();
      return successResponse(activeOffers, undefined, requestId);
    },
    {
      detail: { tags: ["Offers"], summary: "List active bank offers, BOGO campaigns, and payment discounts" },
    }
  )
  .post(
    "/evaluate",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const evaluation = await offerService.evaluateOffer(
        body.offerId,
        body.bookingAmountMinor,
        body.paymentMethod
      );
      return successResponse(evaluation, undefined, requestId);
    },
    {
      body: t.Object({
        offerId: t.String(),
        bookingAmountMinor: t.Number({ minimum: 100 }),
        paymentMethod: t.Optional(t.String()),
      }),
      detail: { tags: ["Offers"], summary: "Evaluate bank offer discount for booking and payment method" },
    }
  );
