import { db } from "@/infrastructure/database/client";
import { coupons } from "@/infrastructure/database/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { ValidationError, NotFoundError } from "@/core/errors/app-error";

export interface CalculatePriceParams {
  basePriceMinor: number;
  couponCode?: string;
}

export class PricingEngine {
  async calculateDiscount(couponCode: string, totalAmountMinor: number) {
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.code, couponCode), eq(coupons.isActive, true)),
    });

    if (!coupon) {
      throw new NotFoundError(`Coupon '${couponCode}' is invalid or inactive`);
    }

    if (coupon.expiresAt < new Date()) {
      throw new ValidationError(`Coupon '${couponCode}' has expired`);
    }

    if (coupon.minOrderMinor && totalAmountMinor < coupon.minOrderMinor) {
      throw new ValidationError(`Order total must be at least ${coupon.minOrderMinor / 100} BDT to apply coupon`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ValidationError(`Coupon '${couponCode}' maximum usage limit reached`);
    }

    let discountMinor = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountMinor = Math.round((totalAmountMinor * coupon.discountValue) / 100);
      if (coupon.maxDiscountMinor && discountMinor > coupon.maxDiscountMinor) {
        discountMinor = coupon.maxDiscountMinor;
      }
    } else if (coupon.discountType === "FIXED") {
      discountMinor = coupon.discountValue;
    }

    // Ensure discount does not exceed order total
    discountMinor = Math.min(discountMinor, totalAmountMinor);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountMinor,
      finalAmountMinor: totalAmountMinor - discountMinor,
    };
  }

  async incrementCouponUsage(couponId: string) {
    await db
      .update(coupons)
      .set({ usedCount: sql`used_count + 1` })
      .where(eq(coupons.id, couponId));
  }
}

export const pricingEngine = new PricingEngine();
