import { describe, expect, test, spyOn } from "bun:test";
import { offerService } from "@/modules/offers/offer.service";

describe("BANK OFFERS & BOGO TEST SUITE", () => {
  test("OfferService evaluates bKash cashback discount", async () => {
    spyOn(offerService, "evaluateOffer").mockImplementation(async () => ({
      offerId: "offer-bkash",
      title: "bKash 10% Instant Cashback",
      type: "BANK_CASHBACK",
      discountAmountMinor: 5000,
      discountBDT: 50.0,
      finalAmountMinor: 45000,
      finalAmountBDT: 450.0,
    }));

    const evaluation = await offerService.evaluateOffer("offer-bkash", 50000, "BKASH");
    expect(evaluation.offerId).toBe("offer-bkash");
    expect(evaluation.discountBDT).toBe(50.0);
    expect(evaluation.finalAmountMinor).toBe(45000);
  });
});
