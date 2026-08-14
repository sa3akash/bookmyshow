import { db } from "@/infrastructure/database/client";
import { wallets, walletTransactions, bookings, payments, outboxEvents } from "@/infrastructure/database/schema";
import { eq, sql } from "drizzle-orm";
import { ValidationError, NotFoundError, PaymentError } from "@/core/errors/app-error";

export class WalletService {
  async getWallet(userId: string) {
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });

    if (!wallet) {
      const [newWallet] = await db
        .insert(wallets)
        .values({
          userId,
          balanceMinor: 0,
          currency: "BDT",
        })
        .returning();
      wallet = newWallet!;
    }

    const txHistory = await db.query.walletTransactions.findMany({
      where: eq(walletTransactions.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 20,
    });

    return {
      userId: wallet.userId,
      balanceMinor: wallet.balanceMinor,
      balanceBDT: wallet.balanceMinor / 100,
      currency: wallet.currency,
      recentTransactions: txHistory,
    };
  }

  async topUpWallet(userId: string, amountMinor: number, description?: string) {
    if (amountMinor <= 0) {
      throw new ValidationError("Top-up amount must be greater than zero");
    }

    return await db.transaction(async (tx) => {
      let wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, userId),
      });

      if (!wallet) {
        const [inserted] = await tx.insert(wallets).values({ userId, balanceMinor: 0 }).returning();
        wallet = inserted!;
      }

      const newBalance = wallet.balanceMinor + amountMinor;

      await tx
        .update(wallets)
        .set({ balanceMinor: newBalance, updatedAt: new Date() })
        .where(eq(wallets.userId, userId));

      const [walletTx] = await tx
        .insert(walletTransactions)
        .values({
          userId,
          type: "TOPUP",
          amountMinor,
          balanceAfterMinor: newBalance,
          description: description || "Wallet balance top-up",
        })
        .returning();

      return {
        userId,
        newBalanceMinor: newBalance,
        newBalanceBDT: newBalance / 100,
        transactionId: walletTx!.id,
      };
    });
  }

  async payWithWallet(userId: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new ValidationError("Unauthorized to pay for this booking");
    }

    if (booking.status !== "SEATS_HELD" && booking.status !== "PAYMENT_PENDING") {
      throw new PaymentError(`Booking is not in payable state (status: ${booking.status})`);
    }

    return await db.transaction(async (tx) => {
      const wallet = await tx.query.wallets.findFirst({
        where: eq(wallets.userId, userId),
      });

      if (!wallet || wallet.balanceMinor < booking.finalAmountMinor) {
        throw new PaymentError(`Insufficient wallet balance. Available: BDT ${(wallet?.balanceMinor || 0) / 100}, Required: BDT ${booking.finalAmountMinor / 100}`);
      }

      const newBalance = wallet.balanceMinor - booking.finalAmountMinor;

      // Deduct balance
      await tx
        .update(wallets)
        .set({ balanceMinor: newBalance, updatedAt: new Date() })
        .where(eq(wallets.userId, userId));

      // Log wallet transaction
      const transactionId = "WTX-PAY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      await tx.insert(walletTransactions).values({
        userId,
        type: "PAYMENT",
        amountMinor: booking.finalAmountMinor,
        balanceAfterMinor: newBalance,
        referenceId: bookingId,
        description: `Payment for booking ${booking.bookingNumber}`,
      });

      // Insert payment record
      const [insertedPayment] = await tx
        .insert(payments)
        .values({
          bookingId: booking.id,
          userId,
          provider: "WALLET",
          transactionId,
          amountMinor: booking.finalAmountMinor,
          currency: "BDT",
          status: "SUCCESS",
        })
        .returning();

      // Confirm booking
      await tx
        .update(bookings)
        .set({ status: "CONFIRMED", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id));

      // Write outbox events
      await tx.insert(outboxEvents).values({
        eventType: "payment.succeeded.v1",
        aggregateType: "payment",
        aggregateId: insertedPayment!.id,
        payload: {
          paymentId: insertedPayment!.id,
          bookingId: booking.id,
          userId,
          provider: "WALLET",
          amountMinor: booking.finalAmountMinor,
        },
      });

      return {
        success: true,
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        paidAmountMinor: booking.finalAmountMinor,
        walletRemainingMinor: newBalance,
        status: "CONFIRMED",
      };
    });
  }
}

export const walletService = new WalletService();
