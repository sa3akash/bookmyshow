import { db } from "@/infrastructure/database/client";
import { refunds, bookings, payments, outboxEvents } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { seatLockService } from "@/modules/inventory/seat-lock.service";
import { walletService } from "@/modules/wallet/wallet.service";
import { financialLedgerService } from "@/core/ledger/ledger.service";
import { idempotencyService } from "@/core/idempotency/idempotency.service";
import { NotFoundError, BookingError, AuthorizationError } from "@/core/errors/app-error";

export interface InitiateRefundDTO {
  bookingId: string;
  userId: string;
  reason: string;
  refundMethod?: "GATEWAY" | "WALLET";
  idempotencyKey?: string;
}

export interface RefundResponse {
  refundId: string;
  bookingId: string;
  amountMinor: number;
  refundBDT: number;
  refundMethod: string;
  status: string;
}

export class RefundService {
  async initiateRefund(dto: InitiateRefundDTO): Promise<RefundResponse> {
    // 1. Idempotency pre-check
    if (dto.idempotencyKey) {
      const cached = await idempotencyService.get<RefundResponse>(dto.idempotencyKey, dto.userId, dto);
      if (cached) {
        return cached.body;
      }
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, dto.bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${dto.bookingId} not found`);
    }

    if (booking.userId !== dto.userId) {
      throw new AuthorizationError("Unauthorized to request refund for this booking");
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "TICKET_ISSUED") {
      throw new BookingError(`Booking status '${booking.status}' is not eligible for refund`);
    }

    const paymentRecord = await db.query.payments.findFirst({
      where: and(eq(payments.bookingId, booking.id), eq(payments.status, "SUCCESS")),
    });

    if (!paymentRecord) {
      throw new NotFoundError(`Successful payment record for booking ${dto.bookingId} not found`);
    }

    const refundAmountMinor = booking.finalAmountMinor;
    const refundMethod = dto.refundMethod || "WALLET";

    const refundResult = await db.transaction(async (tx) => {
      const [newRefund] = await tx
        .insert(refunds)
        .values({
          bookingId: booking.id,
          paymentId: paymentRecord.id,
          userId: dto.userId,
          amountMinor: refundAmountMinor,
          reason: dto.reason,
          status: "PENDING",
        })
        .returning();

      if (refundMethod === "WALLET") {
        // Instant wallet credit
        await walletService.topUpWallet(dto.userId, refundAmountMinor, `Refund for booking ${booking.bookingNumber}`);

        await tx
          .update(refunds)
          .set({ status: "PROCESSED", processedAt: new Date() })
          .where(eq(refunds.id, newRefund!.id));
      }

      // Update booking status
      await tx
        .update(bookings)
        .set({ status: "REFUNDED", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id));

      // Record double-entry financial ledger refund entry
      await financialLedgerService.recordEntry({
        entryType: "REFUND",
        direction: "DEBIT",
        amountMinor: refundAmountMinor,
        referenceType: "refund",
        referenceId: newRefund!.id,
        metadata: { bookingId: booking.id, refundMethod },
      });

      // Write outbox event
      await tx.insert(outboxEvents).values({
        eventType: "refund.created.v1",
        aggregateType: "refund",
        aggregateId: newRefund!.id,
        payload: {
          refundId: newRefund!.id,
          bookingId: booking.id,
          userId: dto.userId,
          amountMinor: refundAmountMinor,
          refundMethod,
        },
      });

      // Release seat hold in DB and Redis
      await seatLockService.releaseHold(booking.holdId);

      return {
        refundId: newRefund!.id,
        bookingId: booking.id,
        amountMinor: refundAmountMinor,
        refundBDT: refundAmountMinor / 100,
        refundMethod,
        status: refundMethod === "WALLET" ? "PROCESSED" : "PENDING",
      };
    });

    if (dto.idempotencyKey) {
      await idempotencyService.save(dto.idempotencyKey, dto.userId, dto, 200, refundResult);
    }

    return refundResult as {
      refundId: string;
      bookingId: string;
      amountMinor: number;
      refundBDT: number;
      refundMethod: string;
      status: string;
    };
  }

  async getRefund(refundId: string, userId: string) {
    const refund = await db.query.refunds.findFirst({
      where: eq(refunds.id, refundId),
    });

    if (!refund) {
      throw new NotFoundError(`Refund ${refundId} not found`);
    }

    if (refund.userId !== userId) {
      throw new AuthorizationError("Unauthorized to view this refund");
    }

    return refund;
  }

  async getRefundByPaymentId(paymentId: string, userId: string) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paymentId);
    const paymentRecord = await db.query.payments.findFirst({
      where: isUuid ? eq(payments.id, paymentId) : eq(payments.transactionId, paymentId),
    });

    const targetPaymentId = paymentRecord ? paymentRecord.id : paymentId;

    const refund = await db.query.refunds.findFirst({
      where: eq(refunds.paymentId, targetPaymentId),
    });

    if (!refund) {
      throw new NotFoundError(`No refund record found for payment: ${paymentId}`);
    }

    if (refund.userId !== userId) {
      throw new AuthorizationError("Unauthorized to view this refund");
    }

    return refund;
  }
}

export const refundService = new RefundService();
