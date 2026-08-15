import { paymentService } from "../service/payment.service";
import { refundService } from "@/modules/refunds/refund.service";

export const paymentTypeDefs = `
  type PaymentIntent {
    paymentId: ID!
    provider: String!
    transactionId: String!
    clientSecret: String
    paymentUrl: String
    amountMinor: Int!
    currency: String!
    status: String!
  }

  type PaymentVerificationResult {
    status: String!
    bookingId: String
    verified: Boolean!
  }

  type PaymentAuditResult {
    reconciled: Boolean
    previousStatus: String
    currentStatus: String
    paymentId: String!
    bookingId: String!
    userId: String!
    provider: String!
    transactionId: String
    amountMinor: Int!
    currency: String!
    verificationStatus: String
    rawWebhookDataJson: String
    createdAt: String
    updatedAt: String
  }

  type DirectGatewayQueryResult {
    queryTransactionId: String!
    provider: String!
    gatewayVerified: Boolean!
    gatewayStatus: String!
    dbMatchFound: Boolean!
    dbReconciled: Boolean!
    localPaymentId: String
    localBookingId: String
    localStatus: String
    gatewayResponseJson: String
  }

  extend type Query {
    paymentByTransaction(transactionId: String!, provider: String): PaymentAuditResult
    queryPaymentGateway(transactionId: String!, provider: String): DirectGatewayQueryResult
    verifyPayment(paymentId: String!): PaymentVerificationResult
  }

  extend type Mutation {
    createPaymentIntent(bookingId: ID!, userId: String!, provider: String): PaymentIntent!
  }
`;

export const paymentResolvers = {
  Query: {
    paymentByTransaction: async (_: unknown, args: { transactionId: string; provider?: string }) => {
      const res = await paymentService.lookupPaymentByTransactionId(args.transactionId, args.provider);
      return {
        ...res,
        rawWebhookDataJson: res.rawWebhookData ? JSON.stringify(res.rawWebhookData) : null,
      };
    },
    queryPaymentGateway: async (_: unknown, args: { transactionId: string; provider?: string }) => {
      const res = await paymentService.queryGatewayDirectly(args.transactionId, args.provider);
      return {
        ...res,
        gatewayResponseJson: res.gatewayResponse ? JSON.stringify(res.gatewayResponse) : null,
      };
    },
    verifyPayment: async (_: unknown, args: { paymentId: string }) => {
      return await paymentService.verifyPaymentIntent(args.paymentId);
    },
  },
  Mutation: {
    createPaymentIntent: async (_: unknown, args: { bookingId: string; userId: string; provider?: string }) => {
      return await paymentService.createPaymentIntent(args.bookingId, args.userId, args.provider || "MOCK");
    },
  },
};
