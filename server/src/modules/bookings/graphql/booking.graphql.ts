import { bookingService } from "../service/booking.service";

export const bookingTypeDefs = `
  type HoldResponse {
    bookingId: ID!
    bookingNumber: String!
    totalAmountMinor: Int!
    expiresAt: String!
  }

  extend type Mutation {
    holdSeats(showId: ID!, seatIds: [ID!]!, userId: String!): HoldResponse!
  }
`;

export const bookingResolvers = {
  Mutation: {
    holdSeats: async (_: unknown, args: { showId: string; seatIds: string[]; userId: string }) => {
      const result = (await bookingService.holdSeats({
        showId: args.showId,
        seatIds: args.seatIds,
        userId: args.userId,
      })) as {
        bookingId: string;
        bookingNumber: string;
        totalAmountMinor: number;
        expiresAt: Date;
      };

      return {
        bookingId: result.bookingId,
        bookingNumber: result.bookingNumber,
        totalAmountMinor: result.totalAmountMinor,
        expiresAt: new Date(result.expiresAt).toISOString(),
      };
    },
  },
};
