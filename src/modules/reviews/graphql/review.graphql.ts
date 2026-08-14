import { reviewService } from "../review.service";

export const reviewTypeDefs = `
  type Review {
    id: ID!
    movieId: String!
    userId: String!
    rating: Int!
    comment: String
  }

  type MovieReviewStats {
    movieId: String!
    averageRating: Float!
    totalReviews: Int!
    reviews: [Review!]!
  }

  extend type Query {
    reviews(movieId: ID!): MovieReviewStats!
  }

  extend type Mutation {
    addReview(movieId: ID!, userId: String!, rating: Int!, comment: String): Review!
  }
`;

export const reviewResolvers = {
  Query: {
    reviews: async (_: unknown, args: { movieId: string }) => {
      return await reviewService.getMovieReviews(args.movieId);
    },
  },
  Mutation: {
    addReview: async (_: unknown, args: { movieId: string; userId: string; rating: number; comment?: string }) => {
      return await reviewService.addReview(args.userId, args.movieId, args.rating, args.comment);
    },
  },
};
