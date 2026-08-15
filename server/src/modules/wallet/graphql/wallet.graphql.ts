import { walletService } from "../wallet.service";

export const walletTypeDefs = `
  type Wallet {
    userId: String!
    balanceMinor: Int!
    balanceBDT: Float!
    currency: String!
  }

  extend type Query {
    wallet(userId: String!): Wallet
  }

  extend type Mutation {
    topupWallet(userId: String!, amountMinor: Int!): Wallet!
  }
`;

export const walletResolvers = {
  Query: {
    wallet: async (_: unknown, args: { userId: string }) => {
      return await walletService.getWallet(args.userId);
    },
  },
  Mutation: {
    topupWallet: async (_: unknown, args: { userId: string; amountMinor: number }) => {
      await walletService.topUpWallet(args.userId, args.amountMinor);
      return await walletService.getWallet(args.userId);
    },
  },
};
