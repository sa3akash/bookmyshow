import { showService } from "../service/show.service";

export const showTypeDefs = `
  type Show {
    id: ID!
    movieId: String!
    screenId: String!
    startTime: String!
    endTime: String!
    language: String!
    format: String!
    basePriceMinor: Int!
  }

  type Seat {
    id: ID!
    seatNumber: String!
    rowLabel: String!
    type: String!
    category: String!
    priceMinor: Int!
    status: String!
  }

  extend type Query {
    shows(movieId: ID!): [Show!]!
    seatMap(showId: ID!): [Seat!]!
  }
`;

export const showResolvers = {
  Query: {
    shows: async (_: unknown, args: { movieId: string }) => {
      const list = await showService.getShowsForMovie(args.movieId);
      return list.map((item) => item.show);
    },
    seatMap: async (_: unknown, args: { showId: string }) => {
      const data = await showService.getShowSeatMap(args.showId);
      return data.seats;
    },
  },
};
