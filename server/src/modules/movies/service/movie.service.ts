import { db } from "@/infrastructure/database/client";
import { redis } from "@/infrastructure/redis/client";
import { movies, movieCast, movieCrew, movieMedia } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";

export interface CreateMovieDTO {
  title: string;
  description?: string;
  durationMinutes: number;
  languages: string[];
  genres: string[];
  releaseDate: Date;
  rating?: string;
  posterUrl?: string;
  bannerUrl?: string;
  cast?: Array<{ actorName: string; characterName?: string; profileImageUrl?: string; roleType?: string }>;
  crew?: Array<{ name: string; jobTitle: string }>;
  media?: Array<{ type: "TRAILER" | "BACKDROP" | "GALLERY" | "CLIP"; url: string; title?: string }>;
}

export class MovieService {
  async listMovies(filters: { cityId?: string; genre?: string; language?: string; status?: "NOW_SHOWING" | "UPCOMING" }) {
    const cacheKey = `movies:list:${filters.status || "ALL"}:${filters.genre || "ALL"}:${filters.language || "ALL"}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Fallback silently if Redis cache miss/error
    }

    const allMovies = await db.query.movies.findMany({
      where: eq(movies.isActive, true),
      orderBy: (m, { desc }) => [desc(m.releaseDate)],
    });

    let result = allMovies;
    const now = new Date();

    if (filters.status === "NOW_SHOWING") {
      result = result.filter((m) => new Date(m.releaseDate) <= now);
    } else if (filters.status === "UPCOMING") {
      result = result.filter((m) => new Date(m.releaseDate) > now);
    }

    if (filters.genre) {
      result = result.filter((m) => m.genres?.includes(filters.genre!));
    }

    if (filters.language) {
      result = result.filter((m) => m.languages?.includes(filters.language!));
    }

    try {
      await redis.setex(cacheKey, 600, JSON.stringify(result)); // 10-minute cache
    } catch {
      // Ignore cache write errors
    }

    return result;
  }

  async getMovieById(id: string) {
    const cacheKey = `movie:detail:${id}`;

    // 1. Production Read-Through Cache (Hits Redis in <1ms)
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug({ movieId: id }, "Movie detail fetched from Redis cache");
        return JSON.parse(cached);
      }
    } catch {
      // Fallback silently to DB if Redis is unreachable
    }

    // 2. Single Relational Database Query (Fetches Movie + Cast + Crew + Media in 1 query)
    const movieWithRelations = await db.query.movies.findFirst({
      where: and(eq(movies.id, id), eq(movies.isActive, true)),
      with: {
        cast: true,
        crew: true,
        media: true,
      },
    });

    if (!movieWithRelations) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }

    // 3. Store in Redis Cache for 1 Hour TTL
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(movieWithRelations));
    } catch {
      // Ignore cache write error
    }

    return movieWithRelations;
  }

  async createMovie(dto: CreateMovieDTO) {
    const result = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(movies)
        .values({
          title: dto.title,
          description: dto.description,
          durationMinutes: dto.durationMinutes,
          languages: dto.languages,
          genres: dto.genres,
          releaseDate: dto.releaseDate,
          rating: dto.rating || "PG-13",
          posterUrl: dto.posterUrl,
          bannerUrl: dto.bannerUrl,
        })
        .returning();

      if (dto.cast && dto.cast.length > 0) {
        await tx.insert(movieCast).values(
          dto.cast.map((c) => ({
            movieId: inserted!.id,
            actorName: c.actorName,
            characterName: c.characterName,
            profileImageUrl: c.profileImageUrl,
            roleType: c.roleType || "LEAD",
          }))
        );
      }

      if (dto.crew && dto.crew.length > 0) {
        await tx.insert(movieCrew).values(
          dto.crew.map((cr) => ({
            movieId: inserted!.id,
            name: cr.name,
            jobTitle: cr.jobTitle,
          }))
        );
      }

      if (dto.media && dto.media.length > 0) {
        await tx.insert(movieMedia).values(
          dto.media.map((m) => ({
            movieId: inserted!.id,
            type: m.type,
            url: m.url,
            title: m.title,
          }))
        );
      }

      return inserted;
    });

    // Invalidate Redis list cache
    try {
      const keys = await redis.keys("movies:list:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Ignore cache invalidation errors
    }

    return result;
  }
}

export const movieService = new MovieService();
