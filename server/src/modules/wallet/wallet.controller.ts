import { Elysia, t } from "elysia";
import { walletService } from "./wallet.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const walletController = new Elysia({ prefix: "/api/v1/wallet" })
  .get(
    "/",
    async ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const walletData = await walletService.getWallet(user.userId);
      return successResponse(walletData, undefined, requestId);
    },
    {
      detail: { tags: ["Payments"], summary: "Get current user digital wallet balance and transaction history" },
    }
  )
  .post(
    "/topup",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await walletService.topUpWallet(user.userId, body.amountMinor, body.description);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        amountMinor: t.Number({ minimum: 100 }), // minimum 1 BDT
        description: t.Optional(t.String()),
      }),
      detail: { tags: ["Payments"], summary: "Top-up user digital wallet balance" },
    }
  )
  .post(
    "/pay",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await walletService.payWithWallet(user.userId, body.bookingId);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        bookingId: t.String(),
      }),
      detail: { tags: ["Payments"], summary: "Pay held booking directly from user wallet balance" },
    }
  );
