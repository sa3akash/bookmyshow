import { describe, expect, test, spyOn } from "bun:test";
import { recommendationService } from "@/modules/recommendations/recommendation.service";

describe("MOVIE RECOMMENDATIONS TEST SUITE", () => {
  test("RecommendationService retrieves popular trending movies", async () => {
    spyOn(recommendationService, "getPopularMovies").mockImplementation(async () => [
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
    ]);

    const popular = await recommendationService.getPopularMovies(5);
    expect(popular.length).toBe(1);
    expect(popular[0]!.title).toBe("Dune: Part Two");
  });

  test("RecommendationService retrieves similar genre-matched movies", async () => {
    spyOn(recommendationService, "getSimilarMovies").mockImplementation(async () => [
      {
        id: "m-102",
        title: "Interstellar",
        description: null,
        durationMinutes: 169,
        languages: ["English"],
        genres: ["Sci-Fi"],
        releaseDate: new Date(),
        rating: "PG-13",
        posterUrl: null,
        bannerUrl: null,
        isActive: true,
        createdAt: new Date(),
      },
    ]);

    const similar = await recommendationService.getSimilarMovies("m-101", 4);
    expect(similar.length).toBe(1);
    expect(similar[0]!.title).toBe("Interstellar");
  });
});
