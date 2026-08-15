import { paymentService } from "../service/payment.service";

export const paymentTypeDefs = `
  type PaymentIntent {
    paymentId: ID!
    provider: String!
    transactionId: String!
    clientSecret: String
    amountMinor: Int!
    currency: String!
    status: String!
  }

  extend type Mutation {
    createPaymentIntent(bookingId: ID!, userId: String!, provider: String): PaymentIntent!
  }
`;

export const paymentResolvers = {
  Mutation: {
    createPaymentIntent: async (_: unknown, args: { bookingId: string; userId: string; provider?: string }) => {
      return await paymentService.createPaymentIntent(args.bookingId, args.userId, args.provider || "MOCK");
    },
  },
};
