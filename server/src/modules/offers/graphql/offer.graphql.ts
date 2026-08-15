import { offerService } from "../offer.service";

export const offerTypeDefs = `
  type Offer {
    id: ID!
    title: String!
    type: String!
    discountPercentage: Int
    paymentMethod: String
  }

  extend type Query {
    offers: [Offer!]!
  }
`;

export const offerResolvers = {
  Query: {
    offers: async () => {
      return await offerService.listActiveOffers();
    },
  },
};
