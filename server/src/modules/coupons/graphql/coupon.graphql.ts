import { pricingEngine } from "../pricing-engine";
import { db } from "@/infrastructure/database/client";

export const couponTypeDefs = `
  type Coupon {
    id: ID!
    code: String!
    discountType: String!
    discountValue: Int!
  }

  type DiscountResult {
    code: String!
    discountAmountMinor: Int!
    finalAmountMinor: Int!
  }

  extend type Query {
    coupons: [Coupon!]!
  }

  extend type Mutation {
    applyCoupon(code: String!, totalAmountMinor: Int!): DiscountResult!
  }
`;

export const couponResolvers = {
  Query: {
    coupons: async () => {
      return await db.query.coupons.findMany();
    },
  },
  Mutation: {
    applyCoupon: async (_: unknown, args: { code: string; totalAmountMinor: number }) => {
      return await pricingEngine.calculateDiscount(args.code, args.totalAmountMinor);
    },
  },
};
