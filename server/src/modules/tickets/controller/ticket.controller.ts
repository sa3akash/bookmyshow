import { Elysia, t } from "elysia";
import { ticketService } from "../ticket.service";
import { pdfInvoiceService } from "../pdf-invoice.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const ticketController = new Elysia({ prefix: "/api/v1/tickets" })
  .post(
    "/issue/:bookingId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const ticketData = await ticketService.issueTicketForBooking(params.bookingId, user.userId);
      return successResponse(ticketData, undefined, requestId);
    },
    {
      params: t.Object({ bookingId: t.String() }),
      detail: { tags: ["Tickets"], summary: "Issue signed e-ticket with QR payload for confirmed booking" },
    }
  )
  .get(
    "/:ticketId",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const ticketData = await ticketService.getTicketDetails(params.ticketId, user.userId);
      return successResponse(ticketData, undefined, requestId);
    },
    {
      params: t.Object({ ticketId: t.String() }),
      detail: { tags: ["Tickets"], summary: "Get ticket details by ticket ID" },
    }
  )
  .get(
    "/pass/:identifier",
    async ({ params, set }) => {
      const pdfBytes = await pdfInvoiceService.generateBoardingPassPDF(params.identifier);
      set.headers["content-type"] = "application/pdf";
      set.headers["content-disposition"] = `inline; filename="theater-pass-${params.identifier}.pdf"`;
      return pdfBytes;
    },
    {
      params: t.Object({ identifier: t.String() }),
      detail: { tags: ["Tickets"], summary: "Download official theater entry boarding pass PDF with QR code" },
    }
  )
  .get(
    "/receipt/:identifier",
    async ({ params, set }) => {
      const pdfBytes = await pdfInvoiceService.generateMoneyReceiptPDF(params.identifier);
      set.headers["content-type"] = "application/pdf";
      set.headers["content-disposition"] = `inline; filename="money-receipt-${params.identifier}.pdf"`;
      return pdfBytes;
    },
    {
      params: t.Object({ identifier: t.String() }),
      detail: { tags: ["Tickets"], summary: "Download official Tax Invoice & Money Receipt PDF document" },
    }
  )
  .get(
    "/:ticketId/pdf",
    async ({ params, set }) => {
      const pdfBytes = await pdfInvoiceService.generateBoardingPassPDF(params.ticketId);
      set.headers["content-type"] = "application/pdf";
      set.headers["content-disposition"] = `attachment; filename="theater-pass-${params.ticketId}.pdf"`;
      return pdfBytes;
    },
    {
      params: t.Object({ ticketId: t.String() }),
      detail: { tags: ["Tickets"], summary: "Download official theater entry boarding pass PDF with QR code" },
    }
  )
  .post(
    "/verify",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("VENUE_MANAGER"); // Only gate ticket scanner roles
      const result = await ticketService.verifyAndClaimTicket(body.ticketCode);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({ ticketCode: t.String() }),
      detail: { tags: ["Tickets"], summary: "Gate ticket scanner QR code verification" },
    }
  )
  .post(
    "/:ticketCode/verify",
    async ({ params, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("VENUE_MANAGER"); // Only gate ticket scanner roles
      const result = await ticketService.verifyAndClaimTicket(params.ticketCode);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ ticketCode: t.String() }),
      detail: { tags: ["Tickets"], summary: "Gate ticket scanner QR code verification by path parameter" },
    }
  );
