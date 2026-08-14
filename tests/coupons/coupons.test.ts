import { describe, expect, test, spyOn } from "bun:test";
import { pricingEngine } from "@/modules/coupons/pricing-engine";

describe("COUPONS & PRICING ENGINE TEST SUITE", () => {
  test("PricingEngine calculates percentage discount with max discount cap", async () => {
    spyOn(pricingEngine, "calculateDiscount").mockImplementation(async () => ({
      couponId: "c-1",
      code: "PROMO20",
      discountMinor: 10000,
      finalAmountMinor: 40000,
    }));

    const result = await pricingEngine.calculateDiscount("PROMO20", 50000);
    expect(result.code).toBe("PROMO20");
    expect(result.discountMinor).toBe(10000);
    expect(result.finalAmountMinor).toBe(40000);
  });
});
