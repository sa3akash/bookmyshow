import { describe, expect, test } from "bun:test";
import { openSearchClient, MovieIndexDocument, VenueIndexDocument } from "@/infrastructure/search/opensearch.client";
import { indexingService } from "@/infrastructure/search/indexing.service";

describe("OPENSEARCH / ELASTICSEARCH ENGINE TEST SUITE", () => {
  test("OpenSearch indexes movie with actors and directors", async () => {
    const movieDoc: MovieIndexDocument = {
      id: "m-avengers-1",
      type: "MOVIE",
      title: "Avengers: Endgame",
      description: "Earth's mightiest heroes attempt to defeat Thanos.",
      languages: ["English", "Hindi"],
      genres: ["Action", "Sci-Fi"],
      actors: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
      directors: ["Anthony Russo", "Joe Russo"],
    };

    await openSearchClient.indexDocument(movieDoc);

    // Exact title query
    const res1 = await openSearchClient.search({ query: "Avengers" });
    expect(res1.total).toBe(1);
    expect((res1.items[0] as MovieIndexDocument).title).toBe("Avengers: Endgame");

    // Actor search
    const res2 = await openSearchClient.search({ query: "Robert Downey" });
    expect(res2.total).toBe(1);

    // Director search
    const res3 = await openSearchClient.search({ query: "Russo" });
    expect(res3.total).toBe(1);
  });

  test("OpenSearch performs fuzzy search with typo tolerance", async () => {
    // Search with typo "Avengars" instead of "Avengers"
    const res = await openSearchClient.search({ query: "Avengars" });
    expect(res.total).toBeGreaterThanOrEqual(1);
    expect((res.items[0] as MovieIndexDocument).title).toContain("Avengers");
  });

  test("OpenSearch performs autocomplete prefix suggestions", async () => {
    const suggestions = await openSearchClient.autocomplete("Aven");
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    expect(suggestions[0]!.text).toContain("Avengers");
  });

  test("IndexingService pushes failed document to Dead-Letter Queue (DLQ)", async () => {
    await indexingService.pushToDeadLetterQueue("MOVIE", "m-failed-99", "Document serialization failed");
    const dlq = await indexingService.getDeadLetterQueue();
    expect(dlq.length).toBeGreaterThanOrEqual(1);
    expect(dlq.some((entry) => entry.id === "m-failed-99")).toBe(true);
  });
});
