import { db } from "@/infrastructure/database/client";
import { bookings, bookingSeats, outboxEvents, seatLocks } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { seatLockService } from "@/modules/inventory/seat-lock.service";
import { idempotencyService } from "@/core/idempotency/idempotency.service";
import { BookingError, NotFoundError, AuthorizationError } from "@/core/errors/app-error";
import { PaymentService } from "@/modules/payments/service/payment.service";

const paymentService = new PaymentService();

export interface CreateBookingHoldDTO {
  userId: string;
  showId: string;
  seatIds: string[];
  couponCode?: string;
  idempotencyKey?: string;
}

export class BookingService {
  /**
   * Section 10: Single-Transaction Atomic Booking Reservation Pipeline:
   * 1. Validate show existence
   * 2. Validate seat existence
   * 3. Validate seat availability (FOR UPDATE row locking)
   * 4. Lock seats & insert seat_locks
   * 5. Create booking record & booking_seats line items
   * 6. Create payment intent
   * 7. Commit PostgreSQL transaction & return atomic result
   */
  async createBookingAtomic(dto: CreateBookingHoldDTO & { providerName?: string }) {
    if (dto.idempotencyKey) {
      const cached = await idempotencyService.get(dto.idempotencyKey, dto.userId, dto);
      if (cached) {
        return cached.body;
      }
    }

    // 1-4. Lock seats atomically (verifies show, seat existence, availability with FOR UPDATE row locks & Redis locks)
    const lockResult = await seatLockService.lockSeats({
      showId: dto.showId,
      seatIds: dto.seatIds,
      userId: dto.userId,
    });

    const bookingNumber = "BMS-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-4);
    const finalAmountMinor = lockResult.totalAmountMinor;

    // 5-7. Create booking, attach hold, and insert outbox event inside transaction
    const bookingResult = await db.transaction(async (tx) => {
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          bookingNumber,
          userId: dto.userId,
          showId: dto.showId,
          holdId: lockResult.holdId,
          status: "PAYMENT_PENDING",
          totalAmountMinor: lockResult.totalAmountMinor,
          discountAmountMinor: 0,
          finalAmountMinor,
          couponCode: dto.couponCode,
          expiresAt: lockResult.expiresAt,
        })
        .returning();

      if (!newBooking) {
        throw new BookingError("Failed to create atomic booking record");
      }

      const bookingSeatRecords = lockResult.seatDetails.map((seat) => ({
        bookingId: newBooking.id,
        seatId: seat.seatId,
        priceMinor: seat.priceMinor,
      }));

      await tx.insert(bookingSeats).values(bookingSeatRecords);
      await seatLockService.attachBookingToHold(lockResult.holdId, newBooking.id);

      await tx.insert(outboxEvents).values({
        eventType: "booking.created.v1",
        aggregateType: "booking",
        aggregateId: newBooking.id,
        payload: {
          bookingId: newBooking.id,
          bookingNumber: newBooking.bookingNumber,
          userId: dto.userId,
          showId: dto.showId,
          seatIds: dto.seatIds,
          finalAmountMinor,
          expiresAt: lockResult.expiresAt.toISOString(),
        },
      });

      return {
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        holdId: lockResult.holdId,
        status: newBooking.status,
        totalAmountMinor: newBooking.totalAmountMinor,
        finalAmountMinor: newBooking.finalAmountMinor,
        expiresAt: newBooking.expiresAt,
        seats: lockResult.seatDetails,
      };
    });

    // Create payment intent for the generated booking
    const providerName = dto.providerName || "MOCK";
    const paymentIntent = await paymentService.createPaymentIntent(
      bookingResult.bookingId,
      dto.userId,
      providerName
    );

    const atomicResult = {
      ...bookingResult,
      paymentIntent,
    };

    if (dto.idempotencyKey) {
      await idempotencyService.save(dto.idempotencyKey, dto.userId, dto, 200, atomicResult);
    }

    return atomicResult;
  }

  async holdSeats(dto: CreateBookingHoldDTO) {
    if (dto.idempotencyKey) {
      const cached = await idempotencyService.get(dto.idempotencyKey, dto.userId);
      if (cached) {
        return cached.body;
      }
    }

    const lockResult = await seatLockService.lockSeats({
      showId: dto.showId,
      seatIds: dto.seatIds,
      userId: dto.userId,
    });

    console.log("lockResult", lockResult);

    const bookingNumber = "BMS-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-4);
    const finalAmountMinor = lockResult.totalAmountMinor;

    const bookingResult = await db.transaction(async (tx) => {
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          bookingNumber,
          userId: dto.userId,
          showId: dto.showId,
          holdId: lockResult.holdId,
          status: "SEATS_HELD",
          totalAmountMinor: lockResult.totalAmountMinor,
          discountAmountMinor: 0,
          finalAmountMinor,
          couponCode: dto.couponCode,
          expiresAt: lockResult.expiresAt,
        })
        .returning();

      if (!newBooking) {
        throw new BookingError("Failed to create booking record");
      }

      const bookingSeatRecords = lockResult.seatDetails.map((seat) => ({
        bookingId: newBooking.id,
        seatId: seat.seatId,
        priceMinor: seat.priceMinor,
      }));

      await tx.insert(bookingSeats).values(bookingSeatRecords);
      await seatLockService.attachBookingToHold(lockResult.holdId, newBooking.id);

      await tx.insert(outboxEvents).values({
        eventType: "booking.created.v1",
        aggregateType: "booking",
        aggregateId: newBooking.id,
        payload: {
          bookingId: newBooking.id,
          bookingNumber: newBooking.bookingNumber,
          userId: dto.userId,
          showId: dto.showId,
          seatIds: dto.seatIds,
          finalAmountMinor,
          expiresAt: lockResult.expiresAt.toISOString(),
        },
      });

      return {
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        holdId: lockResult.holdId,
        status: newBooking.status,
        totalAmountMinor: newBooking.totalAmountMinor,
        finalAmountMinor: newBooking.finalAmountMinor,
        expiresAt: newBooking.expiresAt,
        seats: lockResult.seatDetails,
      };
    });

    if (dto.idempotencyKey) {
      await idempotencyService.save(dto.idempotencyKey, dto.userId, dto, 200, bookingResult);
    }

    return bookingResult;
  }

  async getBooking(bookingId: string, userId: string) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        bookingSeats: true,
      },
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new AuthorizationError("You are not authorized to view this booking");
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new AuthorizationError("You are not authorized to cancel this booking");
    }

    if (booking.status === "TICKET_ISSUED" || booking.status === "CONFIRMED") {
      throw new BookingError("Confirmed bookings cannot be cancelled directly without refund workflow");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(bookings)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));

      await tx.insert(outboxEvents).values({
        eventType: "booking.cancelled.v1",
        aggregateType: "booking",
        aggregateId: bookingId,
        payload: { bookingId, userId },
      });
    });

    await seatLockService.releaseHold(booking.holdId);

    return { message: "Booking cancelled and seat hold released successfully" };
  }
}

export const bookingService = new BookingService();
