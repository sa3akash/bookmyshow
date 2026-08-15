import { db } from "@/infrastructure/database/client";
import { payments, bookings, outboxEvents } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { PaymentProviderFactory } from "@/infrastructure/payments/payment-provider.factory";
import { financialLedgerService } from "@/core/ledger/ledger.service";
import { idempotencyService } from "@/core/idempotency/idempotency.service";
import { PaymentError, NotFoundError, AuthorizationError, ConflictError } from "@/core/errors/app-error";
import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";

export class PaymentService {
  /**
   * Create Payment Intent (Decoupled across Stripe, Razorpay, PayPal, SSLCommerz, bKash, Nagad)
   */
  async createPaymentIntent(
    bookingId: string,
    userId: string,
    providerName: string,
    idempotencyKey?: string
  ) {
    if (idempotencyKey) {
      const cached = await idempotencyService.get(idempotencyKey, userId, { bookingId, providerName });
      if (cached) {
        return cached.body;
      }
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new AuthorizationError("Unauthorized to initiate payment for this booking");
    }

    if (booking.status !== "SEATS_HELD" && booking.status !== "PAYMENT_PENDING") {
      throw new PaymentError(`Cannot initiate payment for booking in state: ${booking.status}`);
    }

    if (booking.expiresAt < new Date()) {
      throw new PaymentError("Booking hold has expired. Please reserve seats again.");
    }

    const provider = PaymentProviderFactory.getProvider(providerName);
    
    const intentResult = await provider.createPaymentIntent({
      bookingId: booking.id,
      amountMinor: booking.finalAmountMinor,
      currency: "BDT",
      description: `Payment for Booking ${booking.bookingNumber}`,
    });

    const result = await db.transaction(async (tx) => {
      const [insertedPayment] = await tx
        .insert(payments)
        .values({
          bookingId: booking.id,
          userId,
          provider: provider.providerName,
          transactionId: intentResult.transactionId,
          amountMinor: intentResult.amountMinor,
          currency: intentResult.currency,
          status: "PENDING",
        })
        .returning();

      await tx
        .update(bookings)
        .set({ status: "PAYMENT_PENDING", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id));

      await tx.insert(outboxEvents).values({
        eventType: "payment.initiated.v1",
        aggregateType: "payment",
        aggregateId: insertedPayment!.id,
        payload: {
          paymentId: insertedPayment!.id,
          bookingId: booking.id,
          provider: provider.providerName,
          transactionId: intentResult.transactionId,
          amountMinor: intentResult.amountMinor,
        },
      });

      return {
        paymentId: insertedPayment!.id,
        provider: provider.providerName,
        transactionId: intentResult.transactionId,
        clientSecret: intentResult.clientSecret,
        paymentUrl: intentResult.paymentUrl,
        amountMinor: intentResult.amountMinor,
        currency: intentResult.currency,
        status: "PENDING",
      };
    });

    if (idempotencyKey) {
      await idempotencyService.save(
        idempotencyKey,
        userId,
        { bookingId, providerName },
        200,
        result
      );
    }

    return result;
  }

  /**
   * INDEPENDENT BACKEND VERIFICATION ("Never trust frontend payment-success responses")
   * Queries payment provider server API to verify payment state before marking booking as CONFIRMED.
   */
  async verifyPaymentIntent(paymentId: string) {
    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!paymentRecord) {
      throw new NotFoundError(`Payment ${paymentId} not found`);
    }

    const provider = PaymentProviderFactory.getProvider(paymentRecord.provider);
    const verification = await provider.verifyPayment(paymentRecord.transactionId || "");

    if (!verification.verified || verification.status !== "SUCCESS") {
      await db
        .update(payments)
        .set({
          status: "FAILED",
          rawWebhookData: verification as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      throw new PaymentError("Independent server payment verification failed");
    }

    if (paymentRecord.status === "SUCCESS") {
      return { status: "SUCCESS", bookingId: paymentRecord.bookingId, verified: true };
    }

    return await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: "SUCCESS",
          rawWebhookData: verification as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      await tx
        .update(bookings)
        .set({ status: "CONFIRMED", updatedAt: new Date() })
        .where(eq(bookings.id, paymentRecord.bookingId));

      await financialLedgerService.recordEntry({
        entryType: "REVENUE",
        direction: "CREDIT",
        amountMinor: paymentRecord.amountMinor,
        referenceType: "payment",
        referenceId: paymentRecord.id,
        metadata: { bookingId: paymentRecord.bookingId, provider: paymentRecord.provider },
      });

      await tx.insert(outboxEvents).values({
        eventType: "payment.succeeded.v1",
        aggregateType: "payment",
        aggregateId: paymentRecord.id,
        payload: {
          paymentId: paymentRecord.id,
          bookingId: paymentRecord.bookingId,
          userId: paymentRecord.userId,
          provider: paymentRecord.provider,
          amountMinor: paymentRecord.amountMinor,
        },
      });

      await tx.insert(outboxEvents).values({
        eventType: "booking.confirmed.v1",
        aggregateType: "booking",
        aggregateId: paymentRecord.bookingId,
        payload: {
          bookingId: paymentRecord.bookingId,
          userId: paymentRecord.userId,
        },
      });

      return { status: "SUCCESS", bookingId: paymentRecord.bookingId, verified: true };
    });
  }

  /**
   * BROWSER REDIRECT CALLBACK HANDLING
   * Handles GET callbacks from bKash, SSLCommerz, Nagad, etc., when redirected back to backend.
   */
  async handleCallback(params: { paymentID?: string; status?: string; provider?: string }) {
    const { paymentID } = params;
    if (!paymentID) {
      throw new PaymentError("Missing paymentID in gateway callback");
    }

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.transactionId, paymentID),
    });

    if (!paymentRecord) {
      throw new NotFoundError(`Payment transaction ${paymentID} not found`);
    }

    const bookingRecord = await db.query.bookings.findFirst({
      where: eq(bookings.id, paymentRecord.bookingId),
    });

    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const showId = bookingRecord?.showId || "";

    // INDEPENDENT SERVER-TO-SERVER VERIFICATION (Never rely on browser callback query params)
    const provider = PaymentProviderFactory.getProvider(paymentRecord.provider);
    const verification = await provider.verifyPayment(paymentRecord.transactionId || "");
    const rawGatewayData = (verification.metadata as Record<string, unknown>) || { callbackParams: params, verification };

    if (verification.verified && verification.status === "SUCCESS") {
      if (paymentRecord.status !== "SUCCESS") {
        await db.transaction(async (tx) => {
          await tx
            .update(payments)
            .set({
              status: "SUCCESS",
              rawWebhookData: rawGatewayData,
              updatedAt: new Date(),
            })
            .where(eq(payments.id, paymentRecord.id));

          await tx
            .update(bookings)
            .set({ status: "CONFIRMED", updatedAt: new Date() })
            .where(eq(bookings.id, paymentRecord.bookingId));

          await financialLedgerService.recordEntry({
            entryType: "REVENUE",
            direction: "CREDIT",
            amountMinor: paymentRecord.amountMinor,
            referenceType: "payment",
            referenceId: paymentRecord.id,
            metadata: { bookingId: paymentRecord.bookingId, provider: paymentRecord.provider },
          });
        });
      }

      const redirectUrl = `${clientBaseUrl}/booking/${showId}/confirmation/${paymentRecord.bookingId}?paymentStatus=SUCCESS`;
      return {
        status: "SUCCESS",
        paymentId: paymentRecord.id,
        bookingId: paymentRecord.bookingId,
        showId,
        redirectUrl,
        verified: true,
        rawGatewayResponse: rawGatewayData,
      };
    }

    // Payment failed or rejected by gateway server
    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: "FAILED",
          rawWebhookData: rawGatewayData,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      await tx
        .update(bookings)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(bookings.id, paymentRecord.bookingId));
    });

    const redirectUrl = `${clientBaseUrl}/booking/${showId}/payment?error=payment_failed&bookingId=${paymentRecord.bookingId}`;

    return {
      status: "FAILED",
      message: `Payment verification failed on ${paymentRecord.provider} gateway server`,
      paymentId: paymentRecord.id,
      bookingId: paymentRecord.bookingId,
      showId,
      redirectUrl,
      verified: false,
      rawGatewayResponse: rawGatewayData,
    };
  }

  /**
   * WEBHOOK SECURITY PROCESSING
   * Enforces signature verification, timestamp verification (<5 mins), replay protection, and event deduplication.
   */
  async handleWebhook(
    providerName: string,
    rawBody: string,
    signature: string,
    timestamp?: string,
    eventId?: string
  ) {
    const provider = PaymentProviderFactory.getProvider(providerName);

    // 1. Signature Verification
    const isValidSignature = provider.verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      throw new PaymentError("Webhook Signature Verification Failed", { statusCode: 400 });
    }

    // 2. Timestamp Verification (Replay Protection: Reject >5 mins old)
    if (timestamp) {
      const webhookTime = Number(timestamp) * 1000;
      const now = Date.now();
      if (Math.abs(now - webhookTime) > 300000) {
        // 5 minutes
        throw new PaymentError("Webhook timestamp expired (Replay Attack blocked)", { statusCode: 400 });
      }
    }

    // 3. Event Deduplication & Idempotency
    const dedupKey = `idempotency:webhook:${providerName}:${eventId || rawBody.slice(0, 32)}`;
    try {
      const existing = await redis.get(dedupKey);
      if (existing) {
        logger.info({ dedupKey }, "Webhook event already processed (Deduplicated)");
        return JSON.parse(existing);
      }
    } catch {}

    const payload = JSON.parse(rawBody) as { transactionId: string; status: "SUCCESS" | "FAILED" };
    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.transactionId, payload.transactionId),
    });

    if (!paymentRecord) {
      throw new NotFoundError(`Payment transaction ${payload.transactionId} not found`);
    }

    if (paymentRecord.status === "SUCCESS") {
      return { message: "Webhook already processed" };
    }

    const result = await db.transaction(async (tx) => {
      if (payload.status === "SUCCESS") {
        await tx
          .update(payments)
          .set({ status: "SUCCESS", rawWebhookData: payload, updatedAt: new Date() })
          .where(eq(payments.id, paymentRecord.id));

        await tx
          .update(bookings)
          .set({ status: "CONFIRMED", updatedAt: new Date() })
          .where(eq(bookings.id, paymentRecord.bookingId));

        await financialLedgerService.recordEntry({
          entryType: "REVENUE",
          direction: "CREDIT",
          amountMinor: paymentRecord.amountMinor,
          referenceType: "payment",
          referenceId: paymentRecord.id,
          metadata: { bookingId: paymentRecord.bookingId, provider: paymentRecord.provider },
        });

        await tx.insert(outboxEvents).values({
          eventType: "payment.succeeded.v1",
          aggregateType: "payment",
          aggregateId: paymentRecord.id,
          payload: {
            paymentId: paymentRecord.id,
            bookingId: paymentRecord.bookingId,
            userId: paymentRecord.userId,
            provider: paymentRecord.provider,
            amountMinor: paymentRecord.amountMinor,
          },
        });

        await tx.insert(outboxEvents).values({
          eventType: "booking.confirmed.v1",
          aggregateType: "booking",
          aggregateId: paymentRecord.bookingId,
          payload: {
            bookingId: paymentRecord.bookingId,
            userId: paymentRecord.userId,
          },
        });

        return { status: "SUCCESS", bookingId: paymentRecord.bookingId };
      } else {
        await tx
          .update(payments)
          .set({ status: "FAILED", rawWebhookData: payload, updatedAt: new Date() })
          .where(eq(payments.id, paymentRecord.id));

        await tx
          .update(bookings)
          .set({ status: "FAILED", updatedAt: new Date() })
          .where(eq(bookings.id, paymentRecord.bookingId));

        return { status: "FAILED", bookingId: paymentRecord.bookingId };
      }
    });

    try {
      await redis.setex(dedupKey, 86400, JSON.stringify(result));
    } catch {}

    return result;
  }
}

export const paymentService = new PaymentService();
