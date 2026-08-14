import { db } from "@/infrastructure/database/client";
import { tickets, bookings, shows, movies, venues, venueScreens, outboxEvents } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import QRCode from "qrcode";
import { env } from "@/config/env";
import { NotFoundError, BookingError, AuthorizationError } from "@/core/errors/app-error";

export class TicketService {
  private generateHmacSignature(payload: string): string {
    const hasher = new Bun.CryptoHasher("sha256", env.JWT_SECRET);
    hasher.update(payload);
    return hasher.digest("hex");
  }

  async issueTicketForBooking(bookingId: string, userId: string) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new AuthorizationError("Unauthorized to issue ticket for this booking");
    }

    if (booking.status !== "CONFIRMED") {
      throw new BookingError(`Cannot issue ticket for booking in status '${booking.status}'`);
    }

    // Check if ticket already issued
    const existingTicket = await db.query.tickets.findFirst({
      where: eq(tickets.bookingId, bookingId),
    });

    if (existingTicket) {
      return existingTicket;
    }

    const ticketCode = "TCK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const payloadToSign = `${ticketCode}:${bookingId}:${booking.showId}`;
    const verificationToken = this.generateHmacSignature(payloadToSign);

    const qrPayload = JSON.stringify({
      ticketCode,
      bookingId,
      showId: booking.showId,
      token: verificationToken,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    return await db.transaction(async (tx) => {
      const [insertedTicket] = await tx
        .insert(tickets)
        .values({
          ticketCode,
          bookingId: booking.id,
          userId: booking.userId,
          showId: booking.showId,
          qrData: qrDataUrl,
          status: "ACTIVE",
        })
        .returning();

      await tx
        .update(bookings)
        .set({ status: "TICKET_ISSUED", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id));

      await tx.insert(outboxEvents).values({
        eventType: "ticket.issued.v1",
        aggregateType: "ticket",
        aggregateId: insertedTicket!.id,
        payload: {
          ticketId: insertedTicket!.id,
          ticketCode: insertedTicket!.ticketCode,
          bookingId: booking.id,
          userId: booking.userId,
        },
      });

      return insertedTicket!;
    });
  }

  async getTicketDetails(ticketId: string, userId: string) {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
    });

    if (!ticket) {
      throw new NotFoundError(`Ticket ${ticketId} not found`);
    }

    if (ticket.userId !== userId) {
      throw new AuthorizationError("Unauthorized to view this ticket");
    }

    return ticket;
  }

  async verifyAndClaimTicket(ticketCode: string) {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.ticketCode, ticketCode),
    });

    if (!ticket) {
      throw new NotFoundError(`Ticket ${ticketCode} not found`);
    }

    if (ticket.status === "USED") {
      throw new BookingError("Ticket has already been scanned/used (Replay detected)", { statusCode: 409 });
    }

    if (ticket.status === "CANCELLED") {
      throw new BookingError("Ticket has been cancelled", { statusCode: 400 });
    }

    await db
      .update(tickets)
      .set({ status: "USED" })
      .where(eq(tickets.id, ticket.id));

    return {
      status: "VALID",
      message: "Ticket verified successfully. Access granted.",
      ticketCode: ticket.ticketCode,
      showId: ticket.showId,
      scannedAt: new Date().toISOString(),
    };
  }
}

export const ticketService = new TicketService();
