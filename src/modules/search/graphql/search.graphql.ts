import { searchService } from "../search.service";

export const searchTypeDefs = `
  type SearchResults {
    movies: [Movie!]!
    venues: [Venue!]!
  }

  extend type Query {
    search(query: String!, cityId: String): SearchResults!
  }
`;

export const searchResolvers = {
  Query: {
    search: async (_: unknown, args: { query: string; cityId?: string }) => {
      return await searchService.searchCatalog(args.query, args.cityId);
    },
  },
};
