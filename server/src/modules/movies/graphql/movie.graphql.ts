import { movieService } from "../service/movie.service";
import { recommendationService } from "@/modules/recommendations/recommendation.service";

export const movieTypeDefs = `
  type Movie {
    id: ID!
    title: String!
    description: String
    durationMinutes: Int!
    languages: [String!]!
    genres: [String!]!
    releaseDate: String!
    rating: String
    posterUrl: String
    bannerUrl: String
    cast: [CastMember!]
    crew: [CrewMember!]
    media: [MediaItem!]
  }

  type CastMember {
    id: ID!
    actorName: String!
    characterName: String
    profileImageUrl: String
    roleType: String
  }

  type CrewMember {
    id: ID!
    name: String!
    jobTitle: String!
  }

  type MediaItem {
    id: ID!
    type: String!
    url: String!
    title: String
  }

  input CreateMovieInput {
    title: String!
    description: String
    durationMinutes: Int!
    languages: [String!]!
    genres: [String!]!
    releaseDate: String!
    rating: String
    posterUrl: String
    bannerUrl: String
  }

  extend type Query {
    movies(cityId: String, genre: String, language: String, status: String): [Movie!]!
    movie(id: ID!): Movie
    popularMovies(limit: Int): [Movie!]!
    similarMovies(id: ID!, limit: Int): [Movie!]!
  }

  extend type Mutation {
    createMovie(input: CreateMovieInput!): Movie!
  }
`;

export const movieResolvers = {
  Query: {
    movies: async (_: unknown, args: { cityId?: string; genre?: string; language?: string; status?: "NOW_SHOWING" | "UPCOMING" }) => {
      return await movieService.listMovies(args);
    },
    movie: async (_: unknown, args: { id: string }) => {
      return await movieService.getMovieById(args.id);
    },
    popularMovies: async (_: unknown, args: { limit?: number }) => {
      return await recommendationService.getPopularMovies(args.limit || 6);
    },
    similarMovies: async (_: unknown, args: { id: string; limit?: number }) => {
      return await recommendationService.getSimilarMovies(args.id, args.limit || 4);
    },
  },
  Mutation: {
    createMovie: async (_: unknown, args: { input: { title: string; description?: string; durationMinutes: number; languages: string[]; genres: string[]; releaseDate: string; rating?: string; posterUrl?: string; bannerUrl?: string } }) => {
      return await movieService.createMovie({
        ...args.input,
        releaseDate: new Date(args.input.releaseDate),
      });
    },
  },
};
