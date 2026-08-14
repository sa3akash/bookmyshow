import { Elysia, t } from "elysia";
import { pricingEngine } from "../pricing-engine";
import { db } from "@/infrastructure/database/client";
import { coupons } from "@/infrastructure/database/schema";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const couponController = new Elysia({ prefix: "/api/v1/coupons" })
  .post(
    "/validate",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const discountResult = await pricingEngine.calculateDiscount(
        body.code,
        body.totalAmountMinor
      );
      return successResponse(discountResult, undefined, requestId);
    },
    {
      body: t.Object({
        code: t.String(),
        totalAmountMinor: t.Number(),
      }),
      detail: { tags: ["Bookings"], summary: "Validate and calculate discount for a coupon code" },
    }
  )
  .post(
    "/",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const [inserted] = await db
        .insert(coupons)
        .values({
          code: body.code,
          discountType: body.discountType,
          discountValue: body.discountValue,
          maxDiscountMinor: body.maxDiscountMinor,
          minOrderMinor: body.minOrderMinor || 0,
          usageLimit: body.usageLimit,
          expiresAt: new Date(body.expiresAt),
        })
        .returning();

      return successResponse(inserted, undefined, requestId);
    },
    {
      body: t.Object({
        code: t.String(),
        discountType: t.Union([t.Literal("PERCENTAGE"), t.Literal("FIXED")]),
        discountValue: t.Number(),
        maxDiscountMinor: t.Optional(t.Number()),
        minOrderMinor: t.Optional(t.Number()),
        usageLimit: t.Optional(t.Number()),
        expiresAt: t.String(),
      }),
      detail: { tags: ["Bookings"], summary: "Create a new coupon (Admin only)" },
    }
  );
