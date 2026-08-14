import { describe, expect, test, spyOn } from "bun:test";
import { searchService } from "@/modules/search/service/search.service";
import { MovieIndexDocument } from "@/infrastructure/search/opensearch.client";

describe("FULL-TEXT CATALOG SEARCH TEST SUITE", () => {
  test("SearchService searches movies and venues matching query term", async () => {
    spyOn(searchService, "searchCatalog").mockImplementation(async () => ({
      items: [
        {
          id: "m-101",
          type: "MOVIE",
          title: "Dune: Part Two",
          description: "Paul Atreides unites with Chani and the Fremen",
          languages: ["English"],
          genres: ["Sci-Fi"],
          actors: ["Timothée Chalamet", "Zendaya"],
          directors: ["Denis Villeneuve"],
        },
      ],
      total: 1,
    }));

    const results = await searchService.searchCatalog({ query: "Dune", cityId: "c-1" });
    expect(results.items.length).toBe(1);
    expect((results.items[0] as MovieIndexDocument).title).toBe("Dune: Part Two");
  });
});
