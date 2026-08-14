import { db } from "@/infrastructure/database/client";
import { movies } from "@/infrastructure/database/schema";
import { eq, desc } from "drizzle-orm";

export class RecommendationService {
  async getPopularMovies(limit: number = 6) {
    return await db.query.movies.findMany({
      orderBy: [desc(movies.createdAt)],
      limit,
    });
  }

  async getSimilarMovies(movieId: string, limit: number = 4) {
    const targetMovie = await db.query.movies.findFirst({
      where: eq(movies.id, movieId),
    });

    if (!targetMovie) return [];

    const allMovies = await db.query.movies.findMany({
      limit: 20,
    });

    // Simple genre matching recommendation logic
    return allMovies
      .filter((m) => m.id !== movieId && m.genres?.some((g) => targetMovie.genres?.includes(g)))
      .slice(0, limit);
  }
}

export const recommendationService = new RecommendationService();
