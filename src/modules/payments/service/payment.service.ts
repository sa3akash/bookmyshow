import { db } from "@/infrastructure/database/client";
import { payments, bookings, outboxEvents } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { PaymentProviderFactory } from "@/infrastructure/payments/payment-provider.factory";
import { financialLedgerService } from "@/core/ledger/ledger.service";
import { PaymentError, NotFoundError, AuthorizationError } from "@/core/errors/app-error";

export class PaymentService {
  async createPaymentIntent(bookingId: string, userId: string, providerName: string = "MOCK") {
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

    // Update DB inside transaction
    return await db.transaction(async (tx) => {
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
        amountMinor: intentResult.amountMinor,
        currency: intentResult.currency,
        status: "PENDING",
      };
    });
  }

  async handleWebhook(providerName: string, payload: { transactionId: string; status: "SUCCESS" | "FAILED" }, signature: string) {
    const provider = PaymentProviderFactory.getProvider(providerName);
    const isValid = provider.verifyWebhookSignature(JSON.stringify(payload), signature);

    if (!isValid) {
      throw new PaymentError("Invalid webhook signature", { statusCode: 400 });
    }

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.transactionId, payload.transactionId),
    });

    if (!paymentRecord) {
      throw new NotFoundError(`Payment transaction ${payload.transactionId} not found`);
    }

    // Idempotency: skip if already processed
    if (paymentRecord.status === "SUCCESS") {
      return { message: "Webhook already processed" };
    }

    return await db.transaction(async (tx) => {
      if (payload.status === "SUCCESS") {
        await tx
          .update(payments)
          .set({ status: "SUCCESS", rawWebhookData: payload, updatedAt: new Date() })
          .where(eq(payments.id, paymentRecord.id));

        await tx
          .update(bookings)
          .set({ status: "CONFIRMED", updatedAt: new Date() })
          .where(eq(bookings.id, paymentRecord.bookingId));

        // Record revenue ledger entry
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
  }
}

export const paymentService = new PaymentService();
