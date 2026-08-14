import { db } from "@/infrastructure/database/client";
import { offers } from "@/infrastructure/database/schema";
import { eq, and, gte } from "drizzle-orm";
import { NotFoundError, ValidationError } from "@/core/errors/app-error";

export class OfferService {
  async listActiveOffers() {
    return await db.query.offers.findMany({
      where: and(
        eq(offers.isActive, true),
        gte(offers.expiresAt, new Date())
      ),
    });
  }

  async evaluateOffer(offerId: string, bookingAmountMinor: number, paymentMethod?: string) {
    const offerRecord = await db.query.offers.findFirst({
      where: eq(offers.id, offerId),
    });

    if (!offerRecord || !offerRecord.isActive || offerRecord.expiresAt < new Date()) {
      throw new NotFoundError("Selected offer is invalid or has expired");
    }

    if (bookingAmountMinor < offerRecord.minOrderMinor) {
      throw new ValidationError(`Minimum order amount of BDT ${offerRecord.minOrderMinor / 100} required for this offer`);
    }

    if (offerRecord.paymentMethod && paymentMethod && offerRecord.paymentMethod.toUpperCase() !== paymentMethod.toUpperCase()) {
      throw new ValidationError(`This offer is valid only for ${offerRecord.paymentMethod} payment method`);
    }

    let discountAmountMinor = 0;

    if (offerRecord.type === "BANK_CASHBACK" || offerRecord.type === "SLAB_DISCOUNT") {
      const percentage = offerRecord.discountPercentage || 0;
      discountAmountMinor = Math.round((bookingAmountMinor * percentage) / 100);
      if (offerRecord.maxDiscountMinor && discountAmountMinor > offerRecord.maxDiscountMinor) {
        discountAmountMinor = offerRecord.maxDiscountMinor;
      }
    } else if (offerRecord.type === "BOGO") {
      // Buy-One-Get-One: discount 50% of 2-seat ticket price
      discountAmountMinor = Math.round(bookingAmountMinor / 2);
      if (offerRecord.maxDiscountMinor && discountAmountMinor > offerRecord.maxDiscountMinor) {
        discountAmountMinor = offerRecord.maxDiscountMinor;
      }
    }

    return {
      offerId: offerRecord.id,
      title: offerRecord.title,
      type: offerRecord.type,
      discountAmountMinor,
      discountBDT: discountAmountMinor / 100,
      finalAmountMinor: Math.max(0, bookingAmountMinor - discountAmountMinor),
      finalAmountBDT: Math.max(0, bookingAmountMinor - discountAmountMinor) / 100,
    };
  }
}

export const offerService = new OfferService();
