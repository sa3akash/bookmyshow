import { db } from "@/infrastructure/database/client";
import { movies, venues, cities } from "@/infrastructure/database/schema";
import { ilike, or, and, eq } from "drizzle-orm";

export class SearchService {
  async searchCatalog(query: string, cityId?: string) {
    const searchPattern = `%${query}%`;

    const matchedMovies = await db
      .select()
      .from(movies)
      .where(
        and(
          eq(movies.isActive, true),
          or(
            ilike(movies.title, searchPattern),
            ilike(movies.description, searchPattern)
          )
        )
      );

    const matchedVenues = await db
      .select({
        venue: venues,
        city: cities,
      })
      .from(venues)
      .innerJoin(cities, eq(venues.cityId, cities.id))
      .where(
        and(
          eq(venues.isActive, true),
          cityId ? eq(venues.cityId, cityId) : undefined,
          or(
            ilike(venues.name, searchPattern),
            ilike(venues.address, searchPattern)
          )
        )
      );

    return {
      movies: matchedMovies,
      venues: matchedVenues,
    };
  }
}

export const searchService = new SearchService();
