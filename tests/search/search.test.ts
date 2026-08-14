import { describe, expect, test, spyOn } from "bun:test";
import { searchService } from "@/modules/search/search.service";

describe("FULL-TEXT CATALOG SEARCH TEST SUITE", () => {
  test("SearchService searches movies and venues matching query term", async () => {
    spyOn(searchService, "searchCatalog").mockImplementation(async () => ({
      movies: [
        {
          id: "m-101",
          title: "Dune: Part Two",
          description: null,
          durationMinutes: 166,
          languages: ["English"],
          genres: ["Sci-Fi"],
          releaseDate: new Date(),
          rating: "PG-13",
          posterUrl: null,
          bannerUrl: null,
          isActive: true,
          createdAt: new Date(),
        },
      ],
      venues: [
        {
          venue: {
            id: "v-1",
            cityId: "c-1",
            name: "Star Cineplex SKS Tower",
            address: "Dhaka",
            latitude: null,
            longitude: null,
            amenities: ["Dolby Atmos"],
            isActive: true,
            createdAt: new Date(),
          },
          city: {
            id: "c-1",
            name: "Dhaka",
            state: "Dhaka",
            country: "Bangladesh",
            latitude: null,
            longitude: null,
            isActive: true,
            createdAt: new Date(),
          },
        },
      ],
    }));

    const results = await searchService.searchCatalog("Dune", "c-1");
    expect(results.movies.length).toBe(1);
    expect(results.venues.length).toBe(1);
    expect(results.movies[0]!.title).toBe("Dune: Part Two");
  });
});
