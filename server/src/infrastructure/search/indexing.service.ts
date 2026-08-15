import { openSearchClient, MovieIndexDocument, VenueIndexDocument, SearchDocument } from "./opensearch.client";
import { db } from "@/infrastructure/database/client";
import { movies, venues, cities } from "@/infrastructure/database/schema";
import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";

export interface DeadLetterEntry {
  id: string;
  type: string;
  error: string;
  timestamp: string;
  attempts: number;
}

export class IndexingService {
  private dlqKey = "dlq:search_indexing";

  /**
   * Incremental Indexing for a Single Movie
   */
  async indexMovie(movieId: string): Promise<void> {
    try {
      const movie = await db.query.movies.findFirst({
        where: (m, { eq }) => eq(m.id, movieId),
        with: {
          cast: true,
          crew: true,
        },
      });

      if (!movie) return;

      const doc: MovieIndexDocument = {
        id: movie.id,
        type: "MOVIE",
        title: movie.title,
        description: movie.description || undefined,
        languages: movie.languages,
        genres: movie.genres,
        actors: movie.cast.map((c) => c.actorName),
        directors: movie.crew.filter((c) => c.jobTitle.toLowerCase() === "director").map((c) => c.name),
        rating: movie.rating || undefined,
        posterUrl: movie.posterUrl || undefined,
        releaseDate: movie.releaseDate.toISOString(),
      };

      await openSearchClient.indexDocument(doc);
    } catch (err: any) {
      await this.pushToDeadLetterQueue("MOVIE", movieId, err?.message || "Indexing error");
    }
  }

  /**
   * Bulk Reindex Full Catalog (Movies & Venues)
   */
  async reindexAllCatalog(): Promise<{ moviesIndexed: number; venuesIndexed: number; failed: number }> {
    logger.info("Starting OpenSearch full catalog reindexing pipeline...");

    let moviesCount = 0;
    let venuesCount = 0;
    let failedCount = 0;

    // 1. Index All Movies with Cast & Crew
    const allMovies = await db.query.movies.findMany({
      with: { cast: true, crew: true },
    });

    const movieDocs: MovieIndexDocument[] = allMovies.map((movie) => ({
      id: movie.id,
      type: "MOVIE",
      title: movie.title,
      description: movie.description || undefined,
      languages: movie.languages,
      genres: movie.genres,
      actors: movie.cast.map((c) => c.actorName),
      directors: movie.crew.filter((c) => c.jobTitle.toLowerCase() === "director").map((c) => c.name),
      rating: movie.rating || undefined,
      posterUrl: movie.posterUrl || undefined,
      releaseDate: movie.releaseDate.toISOString(),
    }));

    const movieResult = await openSearchClient.bulkIndex(movieDocs);
    moviesCount = movieResult.indexed;
    failedCount += movieResult.failed;

    // 2. Index All Venues with City Names
    const allVenues = await db.query.venues.findMany({
      with: { city: true },
    });

    const venueDocs: VenueIndexDocument[] = allVenues.map((v) => ({
      id: v.id,
      type: "VENUE",
      name: v.name,
      cityId: v.cityId,
      cityName: v.city?.name || "Unknown City",
      address: v.address || undefined,
    }));

    const venueResult = await openSearchClient.bulkIndex(venueDocs);
    venuesCount = venueResult.indexed;
    failedCount += venueResult.failed;

    logger.info({ moviesCount, venuesCount, failedCount }, "Completed OpenSearch full catalog reindexing pipeline");

    return {
      moviesIndexed: moviesCount,
      venuesIndexed: venuesCount,
      failed: failedCount,
    };
  }

  /**
   * Push failed indexing item to Dead-Letter Queue (DLQ) in Redis
   */
  async pushToDeadLetterQueue(type: string, id: string, errorMessage: string): Promise<void> {
    const entry: DeadLetterEntry = {
      id,
      type,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      attempts: 1,
    };

    try {
      await redis.lpush(this.dlqKey, JSON.stringify(entry));
      logger.warn({ entry }, "OpenSearch: Indexing failed, document pushed to Dead-Letter Queue (DLQ)");
    } catch {
      // Ignore Redis errors
    }
  }

  /**
   * Read Dead-Letter Queue (DLQ) entries for inspection
   */
  async getDeadLetterQueue(): Promise<DeadLetterEntry[]> {
    try {
      const items = await redis.lrange(this.dlqKey, 0, -1);
      return items.map((item) => JSON.parse(item));
    } catch {
      return [];
    }
  }
}

export const indexingService = new IndexingService();
