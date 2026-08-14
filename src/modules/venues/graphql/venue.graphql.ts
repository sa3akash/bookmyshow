import { venueService } from "../service/venue.service";

export const venueTypeDefs = `
  type City {
    id: ID!
    name: String!
    state: String
    country: String
  }

  type Venue {
    id: ID!
    cityId: String!
    name: String!
    address: String!
    amenities: [String!]
  }

  extend type Query {
    cities: [City!]!
    venues(cityId: String!): [Venue!]!
  }

  extend type Mutation {
    createCity(name: String!, state: String, country: String): City!
    createVenue(cityId: String!, name: String!, address: String!, amenities: [String!]): Venue!
  }
`;

export const venueResolvers = {
  Query: {
    cities: async () => {
      return await venueService.listCities();
    },
    venues: async (_: unknown, args: { cityId: string }) => {
      return await venueService.listVenuesByCity(args.cityId);
    },
  },
  Mutation: {
    createCity: async (_: unknown, args: { name: string; state?: string; country?: string }) => {
      return await venueService.createCity(args);
    },
    createVenue: async (_: unknown, args: { cityId: string; name: string; address: string; amenities?: string[] }) => {
      return await venueService.createVenue(args);
    },
  },
};
