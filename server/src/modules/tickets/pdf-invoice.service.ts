import { jsPDF } from "jspdf";
import { db } from "@/infrastructure/database/client";
import { tickets, bookings, bookingSeats, seats, shows, movies, venueScreens, venues, payments } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";

export class PDFInvoiceService {
  async generateTicketPDF(ticketId: string): Promise<Uint8Array> {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
    });

    if (!ticket) {
      throw new NotFoundError(`Ticket ${ticketId} not found`);
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, ticket.bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking for ticket ${ticketId} not found`);
    }

    const showRecord = await db.query.shows.findFirst({
      where: eq(shows.id, booking.showId),
    });

    const movieRecord = showRecord
      ? await db.query.movies.findFirst({ where: eq(movies.id, showRecord.movieId) })
      : null;

    const screenRecord = showRecord
      ? await db.query.venueScreens.findFirst({ where: eq(venueScreens.id, showRecord.screenId) })
      : null;

    const venueRecord = screenRecord
      ? await db.query.venues.findFirst({ where: eq(venues.id, screenRecord.venueId) })
      : null;

    const bSeats = await db.query.bookingSeats.findMany({
      where: eq(bookingSeats.bookingId, booking.id),
    });

    const seatDetails = await Promise.all(
      bSeats.map(async (bs) => {
        return await db.query.seats.findFirst({ where: eq(seats.id, bs.seatId) });
      })
    );

    const seatNumbers = seatDetails.map((s) => s?.seatNumber || "N/A").join(", ");

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.bookingId, booking.id),
    });

    // Generate jsPDF document
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(230, 0, 50); // BookMyShow Red
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKMYSHOW - OFFICIAL E-TICKET & INVOICE", 15, 20);

    // Order Info
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking Ref #: ${booking.bookingNumber}`, 15, 45);
    doc.text(`Ticket Code #: ${ticket.ticketCode}`, 15, 53);
    doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 15, 61);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 67, 195, 67);

    // Event & Movie Details Box
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 73, 180, 55, "F");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(movieRecord?.title || "Movie Show", 22, 85);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Venue: ${venueRecord?.name || "Cinema Theater"}`, 22, 95);
    doc.text(`Screen: ${screenRecord?.name || "Screen 1"} (${showRecord?.format || "2D"})`, 22, 103);
    doc.text(`Showtime: ${showRecord ? new Date(showRecord.startTime).toLocaleString() : "TBD"}`, 22, 111);
    doc.text(`Seats Allocated: ${seatNumbers}`, 22, 119);

    // Financial Breakdown Table Header
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("ITEMIZED FINANCIAL BREAKDOWN", 15, 142);

    doc.setFillColor(230, 230, 230);
    doc.rect(15, 147, 180, 10, "F");
    doc.setFontSize(10);
    doc.text("Description", 20, 153);
    doc.text("Amount (BDT)", 160, 153);

    // Financial Lines
    let y = 165;
    const baseTicketBDT = (booking.totalAmountMinor / 100).toFixed(2);
    const discountBDT = (booking.discountAmountMinor / 100).toFixed(2);
    const finalPaidBDT = (booking.finalAmountMinor / 100).toFixed(2);

    doc.setFont("helvetica", "normal");
    doc.text(`Tickets Subtotal (${bSeats.length} seats)`, 20, y);
    doc.text(`BDT ${baseTicketBDT}`, 160, y);

    if (booking.discountAmountMinor > 0) {
      y += 8;
      doc.text("Promotional Coupon Discount", 20, y);
      doc.text(`- BDT ${discountBDT}`, 160, y);
    }

    y += 12;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y - 5, 195, y - 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT PAID", 20, y);
    doc.text(`BDT ${finalPaidBDT}`, 160, y);

    // Payment Gateway Info
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Gateway: ${paymentRecord?.provider || "DIGITAL_PAYMENT"}`, 15, y);
    doc.text(`Transaction ID: ${paymentRecord?.transactionId || "TXN-CONFIRMED"}`, 15, y + 6);

    // Footer Security Notice
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("This is an electronically generated valid e-ticket invoice. Please present the QR code at venue entrance.", 15, 270);
    doc.text("BookMyShow Engine © 2026. All rights reserved.", 15, 276);

    const pdfBuffer = doc.output("arraybuffer");
    return new Uint8Array(pdfBuffer);
  }
}

export const pdfInvoiceService = new PDFInvoiceService();
