import { settlementService } from "../settlement.service";

export const settlementTypeDefs = `
  type MerchantSettlement {
    id: String!
    merchantId: String!
    periodStart: String!
    periodEnd: String!
    grossRevenueBDT: Float!
    platformFeeBDT: Float!
    taxBDT: Float!
    netPayoutBDT: Float!
    status: String!
  }

  extend type Query {
    merchantSettlement(merchantId: String!): MerchantSettlement
  }
`;

export const settlementResolvers = {
  Query: {
    merchantSettlement: async (_: unknown, args: { merchantId: string }) => {
      const start = new Date(Date.now() - 30 * 86400000);
      const end = new Date();
      const s = await settlementService.generateVenueSettlement(args.merchantId, start, end);
      return {
        id: "settlementId" in s ? s.settlementId : `stl-${args.merchantId}`,
        merchantId: args.merchantId,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        grossRevenueBDT: "totalTicketRevenueMinor" in s ? s.totalTicketRevenueMinor / 100 : 0,
        platformFeeBDT: "platformFeeMinor" in s ? s.platformFeeMinor / 100 : 0,
        taxBDT: "taxAmountMinor" in s ? s.taxAmountMinor / 100 : 0,
        netPayoutBDT: "netPayoutBDT" in s ? s.netPayoutBDT : ("netPayoutMinor" in s ? s.netPayoutMinor / 100 : 0),
        status: "status" in s ? s.status : "SETTLED",
      };
    },
  },
};
