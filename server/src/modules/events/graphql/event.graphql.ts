import { eventService } from "../event.service";

export const eventTypeDefs = `
  type Event {
    id: ID!
    title: String!
    description: String
    category: String!
    venueName: String!
    bannerUrl: String
  }

  extend type Query {
    events(category: String): [Event!]!
  }
`;

export const eventResolvers = {
  Query: {
    events: async (_: unknown, args: { category?: string }) => {
      return await eventService.listEvents(args.category);
    },
  },
};
