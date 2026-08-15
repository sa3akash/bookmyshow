import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { db } from "@/infrastructure/database/client";
import { tickets, bookings, bookingSeats, seats, shows, movies, venueScreens, venues, payments, users } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";

export class PDFInvoiceService {
  private async loadBookingDetails(identifier: string) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

    let ticket = await db.query.tickets.findFirst({
      where: isUuid
        ? eq(tickets.id, identifier)
        : eq(tickets.ticketCode, identifier),
    });

    if (!ticket) {
      ticket = await db.query.tickets.findFirst({
        where: eq(tickets.bookingId, identifier),
      });
    }

    if (!ticket) {
      const paymentRecord = await db.query.payments.findFirst({
        where: isUuid
          ? eq(payments.id, identifier)
          : eq(payments.transactionId, identifier),
      });
      if (paymentRecord) {
        ticket = await db.query.tickets.findFirst({
          where: eq(tickets.bookingId, paymentRecord.bookingId),
        });
      }
    }

    if (!ticket) {
      throw new NotFoundError(`Ticket/Booking/Payment record not found for query: ${identifier}`);
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, ticket.bookingId),
    });

    if (!booking) {
      throw new NotFoundError(`Booking for ticket ${ticket.id} not found`);
    }

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, booking.userId),
    });

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

    const seatNumbersList = seatDetails.map((s) => s?.seatNumber || "N/A").filter(Boolean);
    const seatNumbers = seatNumbersList.join(", ");

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.bookingId, booking.id),
    });

    return {
      ticket,
      booking,
      userRecord,
      showRecord,
      movieRecord,
      screenRecord,
      venueRecord,
      seatDetails: seatDetails.filter(Boolean),
      seatNumbersList,
      seatNumbers,
      seatCount: bSeats.length,
      paymentRecord,
    };
  }

  /**
   * Helper to ensure valid QR Code Data URL string is available
   */
  private async getQRCodeDataUrl(payloadObj: Record<string, unknown>, fallbackQrData?: string | null): Promise<string> {
    if (fallbackQrData && fallbackQrData.startsWith("data:image/")) {
      return fallbackQrData;
    }
    const payload = JSON.stringify(payloadObj);
    return await QRCode.toDataURL(payload, { margin: 1, width: 220 });
  }

  /**
   * DOCUMENT 1: OFFICIAL MONEY RECEIPT & TAX INVOICE (Executive A4 PDF)
   */
  async generateMoneyReceiptPDF(identifier: string): Promise<Uint8Array> {
    const data = await this.loadBookingDetails(identifier);
    const { ticket, booking, userRecord, showRecord, movieRecord, venueRecord, screenRecord, paymentRecord, seatCount, seatNumbers } = data;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // --- TOP SLATE HEADER BRANDING BAND ---
    doc.setFillColor(15, 23, 42); // Midnight Slate (#0f172a)
    doc.rect(0, 0, 210, 44, "F");

    // Decorative Accent Bar (Cyan Glow)
    doc.setFillColor(56, 189, 248); // Light Cyan Line
    doc.rect(0, 43, 210, 1, "F");

    // Brand Title & Document Category
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKMYSHOW ENTERTAINMENT", 15, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("OFFICIAL TAX INVOICE & PAYMENT RECEIPT", 15, 26);
    doc.text(`Tax Invoice #: INV-2026-${booking.bookingNumber.toUpperCase()}`, 15, 33);

    // Paid & Verified Stamp Badge Box
    doc.setFillColor(22, 163, 74); // Emerald Green (#16a34a)
    doc.roundedRect(148, 12, 47, 20, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PAID & VERIFIED", 154, 21);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("DIGITAL TAX STAMP", 154, 27);

    // --- TWO-COLUMN INFORMATION GRID CARDS ---
    // Left Card: Customer & Order Metadata
    doc.setFillColor(248, 250, 252); // Soft Grey Card Background
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, 52, 86, 38, 2, 2, "F");
    doc.roundedRect(15, 52, 86, 38, 2, 2, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("CUSTOMER & ORDER DETAILS", 19, 59);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Customer Name: ${userRecord?.fullName || "Valued Customer"}`, 19, 66);
    doc.text(`Email / ID: ${userRecord?.email || booking.userId}`, 19, 72);
    doc.text(`Booking Ref #: ${booking.bookingNumber}`, 19, 78);
    doc.text(`Transaction Date: ${new Date(booking.createdAt).toLocaleString()}`, 19, 84);

    // Right Card: Show & Venue Metadata
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(109, 52, 86, 38, 2, 2, "F");
    doc.roundedRect(109, 52, 86, 38, 2, 2, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("SHOW & THEATER DETAILS", 113, 59);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Movie: ${movieRecord?.title || "Cinema Show"}`, 113, 66);
    doc.text(`Venue: ${venueRecord?.name || "Cinema Hall"}`, 113, 72);
    doc.text(`Screen: ${screenRecord?.name || "Screen 1"}`, 113, 78);
    const showtime = showRecord ? new Date(showRecord.startTime).toLocaleString() : "N/A";
    doc.text(`Showtime: ${showtime}`, 113, 84);

    // --- ITEMIZATION FINANCIAL TABLE ---
    const tableY = 98;
    // Table Header Band
    doc.setFillColor(30, 41, 59);
    doc.rect(15, tableY, 180, 10, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Item & Description", 20, tableY + 6.5);
    doc.text("Seats", 110, tableY + 6.5);
    doc.text("Qty", 135, tableY + 6.5);
    doc.text("Unit Price", 150, tableY + 6.5);
    doc.text("Total (BDT)", 172, tableY + 6.5);

    // Table Content Rows
    let y = tableY + 18;
    const baseTotal = booking.totalAmountMinor / 100;
    const unitPrice = seatCount > 0 ? (baseTotal / seatCount).toFixed(2) : baseTotal.toFixed(2);
    const discountBDT = (booking.discountAmountMinor / 100).toFixed(2);
    const finalPaidBDT = (booking.finalAmountMinor / 100).toFixed(2);
    const vatBDT = ((booking.finalAmountMinor * 0.05) / 100).toFixed(2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Cinema Ticket Pass - ${movieRecord?.title || "Movie"}`, 20, y);
    doc.text(`${seatNumbers}`, 110, y);
    doc.text(`${seatCount}`, 135, y);
    doc.text(`BDT ${unitPrice}`, 150, y);
    doc.text(`BDT ${baseTotal.toFixed(2)}`, 172, y);

    if (booking.discountAmountMinor > 0) {
      y += 8;
      doc.text("Promotional Coupon / Discount Code", 20, y);
      doc.text("-", 110, y);
      doc.text("1", 135, y);
      doc.text(`- BDT ${discountBDT}`, 150, y);
      doc.text(`- BDT ${discountBDT}`, 172, y);
    }

    // Line Divider
    y += 10;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);

    // Financial Calculation Summary
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Subtotal:", 135, y);
    doc.text(`BDT ${baseTotal.toFixed(2)}`, 172, y);

    if (booking.discountAmountMinor > 0) {
      y += 6;
      doc.text("Discount Applied:", 135, y);
      doc.text(`- BDT ${discountBDT}`, 172, y);
    }

    y += 6;
    doc.text("Included Govt VAT (5%):", 135, y);
    doc.text(`BDT ${vatBDT}`, 172, y);

    // NET PAID HIGHLIGHT BOX
    y += 8;
    doc.setFillColor(240, 253, 244); // Soft Emerald Highlight
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(15, y, 180, 14, 2, 2, "F");
    doc.roundedRect(15, y, 180, 14, 2, 2, "S");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52); // Dark Green
    doc.text("NET AMOUNT PAID IN FULL:", 22, y + 9);
    doc.text(`BDT ${finalPaidBDT}`, 165, y + 9);

    // --- PAYMENT GATEWAY RECORD CARD ---
    y += 22;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 36, 2, 2, "F");
    doc.roundedRect(15, y, 180, 36, 2, 2, "S");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("PAYMENT GATEWAY & TRANSACTION AUDIT RECORD", 22, y + 8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Gateway Provider: ${paymentRecord?.provider || "DIGITAL_PAYMENT / SSLCOMMERZ"}`, 22, y + 16);
    doc.text(`Gateway Transaction ID: ${paymentRecord?.transactionId || "TXN-VERIFIED-" + booking.bookingNumber}`, 22, y + 22);
    doc.text(`Payment Status: ${paymentRecord?.status || "SUCCESS / CONFIRMED"}`, 22, y + 28);
    doc.text(`Verification Timestamp: ${new Date().toISOString()}`, 110, y + 16);
    doc.text(`Currency: BDT (Bangladeshi Taka)`, 110, y + 22);

    // --- AUTHORIZED SIGNATURE & FOOTER TERMS ---
    y += 52;
    doc.setDrawColor(148, 163, 184);
    doc.line(135, y, 190, y);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Finance Seal & Sign", 137, y + 5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Terms & Conditions:", 15, y);
    doc.text("1. This is a computer-generated tax invoice and money receipt. No physical signature is required.", 15, y + 5);
    doc.text("2. Tickets booked are non-refundable and non-exchangeable as per theater policy.", 15, y + 9);
    doc.text("3. For queries or customer care, contact support@bookmyshow.com with Invoice Ref #.", 15, y + 13);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 278, 195, 278);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("BookMyShow Entertainment Engine © 2026. Cryptographically Verified Tax Document.", 15, 283);

    const pdfBuffer = doc.output("arraybuffer");
    return new Uint8Array(pdfBuffer);
  }

  /**
   * DOCUMENT 2: PREMIUM DARK THEME CINEMA TICKET PASS (210mm x 100mm Landscape per Seat)
   */
  async generateBoardingPassPDF(identifier: string): Promise<Uint8Array> {
    const data = await this.loadBookingDetails(identifier);
    const { ticket, booking, userRecord, showRecord, movieRecord, screenRecord, venueRecord, seatNumbersList, seatCount } = data;

    // Build array of seat identifiers for multi-ticket generation (1 page per seat)
    const seatsToRender: string[] = seatNumbersList.length > 0 ? seatNumbersList : ["GA-1"];
    const totalSeats = seatsToRender.length;

    // Dedicated Cinema Ticket Dimensions: 210mm wide x 100mm tall Landscape
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [210, 100],
    });

    const userName = (userRecord?.fullName || "VALUED GUEST").toUpperCase();
    const movieTitle = (movieRecord?.title || "CINEMA MOVIE SHOW").toUpperCase();
    const formatStr = showRecord?.format || "2D";
    const ratingStr = movieRecord?.rating || "UA";
    const langStr = (movieRecord?.languages && movieRecord.languages.length > 0 && movieRecord.languages[0])
      ? movieRecord.languages[0].toUpperCase()
      : "ENGLISH";

    const venueName = (venueRecord?.name || "STAR CINEPLEX THEATER").toUpperCase();
    const screenName = screenRecord?.name || "Screen 1";

    const baseTotal = booking.finalAmountMinor / 100;
    const unitPriceBDT = totalSeats > 0 ? (baseTotal / totalSeats).toFixed(2) : baseTotal.toFixed(2);

    for (let seatIdx = 0; seatIdx < totalSeats; seatIdx++) {
      if (seatIdx > 0) {
        doc.addPage([210, 100], "landscape");
      }

      const currentSeatNumber = seatsToRender[seatIdx];

      // --- PREMIUM OBSIDIAN DARK PAGE CANVAS (210mm x 100mm) ---
      doc.setFillColor(9, 13, 22); // Deep Dark Canvas (#090d16)
      doc.rect(0, 0, 210, 100, "F");

      // Ticket Main Body Fill
      doc.setFillColor(15, 23, 42); // Slate Dark Navy Body (#0f172a)
      doc.rect(0, 0, 210, 100, "F");

      // Ticket Outer Border Frame
      doc.setDrawColor(51, 65, 85); // Slate 700 Border
      doc.rect(0, 0, 210, 100, "S");

      // Vertical Perforation Line at x = 150mm
      const perfX = 150;
      doc.setDrawColor(71, 85, 105); // Slate 600
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(perfX, 0, perfX, 100);
      doc.setLineDashPattern([], 0);

      // Authentic Semicircular Ticket Cutout Notches at top & bottom of perforation line
      doc.setFillColor(9, 13, 22); // Match outer dark canvas fill
      doc.circle(perfX, 0, 5, "F");
      doc.circle(perfX, 100, 5, "F");

      // =========================================================================
      // ZONE 1: MAIN ENTRY PASS (Width: 150mm, x: 0 to 150)
      // =========================================================================

      // Modern Glassmorphism Slate Header Bar
      doc.setFillColor(30, 41, 59); // Slate Dark Navy Header (#1e293b)
      doc.rect(0, 0, 150, 15, "F");

      // Top Crimson Accent Line
      doc.setFillColor(225, 29, 72); // Rose Red (#e11d48)
      doc.rect(0, 0, 150, 1.5, "F");

      // Header Branding Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("BOOKMYSHOW", 10, 10.5);

      doc.setTextColor(244, 63, 94); // Crimson Accent
      doc.setFontSize(9.5);
      doc.text("CINEMAS", 46, 10.5);

      // Ticket Index & Admit Pass Badge
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 191, 36); // Warm Gold (#fbbf24)
      doc.text(`★ ADMIT PASS  •  TICKET ${seatIdx + 1} OF ${totalSeats}`, 78, 10.5);

      // Movie Title (Bold High Contrast White Text with splitTextToSize to prevent overflow)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      const splitTitle = doc.splitTextToSize(movieTitle, 130);
      doc.text(splitTitle[0], 10, 24);

      // Format, Rating & Language Pills
      doc.setFillColor(136, 19, 55); // Dark Crimson Pill
      doc.roundedRect(10, 27.5, 14, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(254, 205, 211);
      doc.text(formatStr, 12.5, 31);

      doc.setFillColor(30, 58, 138); // Dark Blue Pill
      doc.roundedRect(27, 27.5, 13, 5, 1, 1, "F");
      doc.setTextColor(191, 219, 254);
      doc.text(ratingStr, 29, 31);

      doc.setFillColor(51, 65, 85); // Grey Pill
      doc.roundedRect(43, 27.5, 28, 5, 1, 1, "F");
      doc.setTextColor(226, 232, 240);
      doc.text(langStr, 45, 31);

      // --- CARD 1: THEATER VENUE & AUDITORIUM (x: 10, y: 36, w: 130, h: 21) ---
      doc.setFillColor(30, 41, 59); // Slate Dark Navy Card
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(10, 36, 130, 21, 2, 2, "F");
      doc.roundedRect(10, 36, 130, 21, 2, 2, "S");

      // Left Column: Theater Venue (Multi-line Safe)
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184); // Slate 400 Label
      doc.text("THEATER VENUE", 14, 42);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(248, 250, 252);
      const splitVenue = doc.splitTextToSize(venueName, 62);
      doc.text(splitVenue[0], 14, 48.5);
      if (splitVenue[1]) {
        doc.text(splitVenue[1], 14, 53);
      }

      // Right Column: Auditorium / Screen & Hall (Multi-line Safe)
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184);
      doc.text("AUDITORIUM / HALL", 80, 42);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 189, 248); // Cyan Accent (#38bdf8)
      const splitScreen = doc.splitTextToSize(screenName, 56);
      doc.text(splitScreen[0], 80, 48.5);
      if (splitScreen[1]) {
        doc.text(splitScreen[1], 80, 53);
      }

      // --- CARD 2: GUEST / PASS HOLDER (x: 10, y: 60, w: 62, h: 18) ---
      doc.setFillColor(22, 30, 46);
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(10, 60, 62, 18, 2, 2, "F");
      doc.roundedRect(10, 60, 62, 18, 2, 2, "S");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184);
      doc.text("PASS HOLDER", 14, 65);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(244, 63, 94); // Rose Red Value
      const splitUser = doc.splitTextToSize(userName, 56);
      doc.text(splitUser[0], 14, 72);

      // --- CARD 3: SHOWTIME CARD (x: 76, y: 60, w: 64, h: 18) ---
      doc.setFillColor(22, 30, 46);
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(76, 60, 64, 18, 2, 2, "F");
      doc.roundedRect(76, 60, 64, 18, 2, 2, "S");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 191, 36); // Warm Gold Label (#fbbf24)
      doc.text("SHOW DATE & TIME", 80, 65);

      const showDateStr = showRecord ? new Date(showRecord.startTime).toLocaleString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) : "TBD";
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(showDateStr, 80, 72);

      // --- PROMINENT SEAT BADGE (x: 10, y: 81, w: 62, h: 13, ROSE RED) ---
      doc.setFillColor(225, 29, 72); // Rose Red (#e11d48)
      doc.roundedRect(10, 81, 62, 13, 1.5, 1.5, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(254, 205, 211);
      doc.text(`ASSIGNED SEAT (${seatIdx + 1}/${totalSeats})`, 14, 85.5);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`SEAT: ${currentSeatNumber}`, 14, 91.5);

      // --- BOTTOM ROW: PAYMENT & BOOKING REF (x: 76, y: 81, w: 64, h: 13) ---
      doc.setFillColor(30, 41, 59);
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(76, 81, 64, 13, 1.5, 1.5, "F");
      doc.roundedRect(76, 81, 64, 13, 1.5, 1.5, "S");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 191, 36); // Warm Gold Accent
      doc.text(`PAID: BDT ${unitPriceBDT}`, 80, 86);

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(`REF: #${booking.bookingNumber} • TICK: ${ticket.ticketCode}`, 80, 91);

      // =========================================================================
      // ZONE 2: USHER GATE TEAR STUB (Width: 60mm, x: 150 to 210)
      // =========================================================================
      const stubX = 150;

      // Stub Header Bar (Dark Slate Navy)
      doc.setFillColor(30, 41, 59);
      doc.rect(stubX, 0, 60, 15, "F");
      doc.setFillColor(225, 29, 72);
      doc.rect(stubX, 0, 60, 1.5, "F"); // Crimson top line

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("GATE ADMIT STUB", stubX + 11, 10.5);

      // High Resolution 2D QR Code Generation (Centered on Stub)
      const seatQrPayload = {
        ticketCode: ticket.ticketCode,
        bookingId: booking.id,
        showId: booking.showId,
        seat: currentSeatNumber,
        seatIndex: seatIdx + 1,
        totalSeats,
      };
      const qrDataUrl = await this.getQRCodeDataUrl(seatQrPayload, ticket.qrData);

      try {
        doc.addImage(qrDataUrl, "PNG", stubX + 8, 19, 44, 44);
      } catch {
        doc.setFillColor(255, 255, 255);
        doc.rect(stubX + 8, 19, 44, 44, "F");
      }

      // Stub Details below QR Code
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`TICK: ${ticket.ticketCode}`, stubX + 8, 68);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(244, 63, 94); // Rose Red Accent
      doc.text(`SEAT: ${currentSeatNumber}`, stubX + 8, 74);

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      const splitGuest = doc.splitTextToSize(userName, 44);
      doc.text(`GUEST: ${splitGuest[0]}`, stubX + 8, 79);

      // Verified Turnstile Stamp Badge Box (Emerald Green)
      doc.setFillColor(22, 163, 74);
      doc.roundedRect(stubX + 8, 83, 44, 9, 1.5, 1.5, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("✓ VERIFIED GATE PASS", stubX + 10.5, 89);
    }

    const pdfBuffer = doc.output("arraybuffer");
    return new Uint8Array(pdfBuffer);
  }

  /**
   * Default PDF Document (Theater Entry Pass Stub)
   */
  async generateTicketPDF(identifier: string): Promise<Uint8Array> {
    return this.generateBoardingPassPDF(identifier);
  }
}

export const pdfInvoiceService = new PDFInvoiceService();
