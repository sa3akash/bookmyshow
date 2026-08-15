import { recommendationService } from "../recommendation.service";

export const recommendationTypeDefs = `
  type RecommendedMovieItem {
    id: String!
    title: String!
    genre: String
    matchScore: Float
  }

  extend type Query {
    userRecommendations(userId: String!): [RecommendedMovieItem!]!
  }
`;

export const recommendationResolvers = {
  Query: {
    userRecommendations: async (_: unknown, args: { userId: string }) => {
      const list = await recommendationService.getPopularMovies();
      return list.map((m: any) => ({
        id: m.movieId,
        title: m.movieTitle,
        matchScore: m.score,
      }));
    },
  },
};
