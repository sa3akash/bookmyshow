import { ticketService } from "../ticket.service";

export const ticketTypeDefs = `
  type Ticket {
    id: ID!
    ticketCode: String!
    bookingId: String!
    userId: String!
    showId: String!
    qrData: String!
    status: String!
  }

  type VerificationResult {
    status: String!
    message: String!
    ticketCode: String!
    showId: String!
    scannedAt: String!
  }

  extend type Query {
    ticket(id: ID!, userId: String!): Ticket
  }

  extend type Mutation {
    issueTicket(bookingId: ID!, userId: String!): Ticket!
    verifyTicket(ticketCode: String!): VerificationResult!
  }
`;

export const ticketResolvers = {
  Query: {
    ticket: async (_: unknown, args: { id: string; userId: string }) => {
      return await ticketService.getTicketDetails(args.id, args.userId);
    },
  },
  Mutation: {
    issueTicket: async (_: unknown, args: { bookingId: string; userId: string }) => {
      return await ticketService.issueTicketForBooking(args.bookingId, args.userId);
    },
    verifyTicket: async (_: unknown, args: { ticketCode: string }) => {
      return await ticketService.verifyAndClaimTicket(args.ticketCode);
    },
  },
};
