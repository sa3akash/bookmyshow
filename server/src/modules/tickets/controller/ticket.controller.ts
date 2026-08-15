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
    "/:ticketId/pdf",
    async ({ params, set }) => {
      const pdfBytes = await pdfInvoiceService.generateTicketPDF(params.ticketId);
      
      set.headers["content-type"] = "application/pdf";
      set.headers["content-disposition"] = `attachment; filename="ticket-${params.ticketId}.pdf"`;
      return pdfBytes;
    },
    {
      params: t.Object({ ticketId: t.String() }),
      detail: { tags: ["Tickets"], summary: "Download official e-ticket invoice as PDF document" },
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
      detail: { tags: ["Tickets"], summary: "Gate ticket scanner QR code verification" },
    }
  );
