import { refundService } from "../refund.service";

export const refundTypeDefs = `
  type Refund {
    id: ID!
    bookingId: String!
    userId: String!
    amountMinor: Int!
    status: String!
  }

  type RefundResponse {
    refundId: ID!
    bookingId: String!
    amountMinor: Int!
    refundBDT: Float!
    refundMethod: String!
    status: String!
  }

  extend type Query {
    refund(id: ID!, userId: String!): Refund
  }

  extend type Mutation {
    requestRefund(bookingId: ID!, userId: String!, reason: String, refundMethod: String): RefundResponse!
  }
`;

export const refundResolvers = {
  Query: {
    refund: async (_: unknown, args: { id: string; userId: string }) => {
      return await refundService.getRefund(args.id, args.userId);
    },
  },
  Mutation: {
    requestRefund: async (_: unknown, args: { bookingId: string; userId: string; reason?: string; refundMethod?: "WALLET" | "GATEWAY" }) => {
      return await refundService.initiateRefund({
        bookingId: args.bookingId,
        userId: args.userId,
        reason: args.reason || "Customer requested refund",
        refundMethod: args.refundMethod,
      });
    },
  },
};
