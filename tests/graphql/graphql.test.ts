import { describe, expect, test, spyOn } from "bun:test";
import { app } from "@/app/app";
import { graphqlService } from "@/modules/graphql/graphql.service";
import { movieService } from "@/modules/movies/service/movie.service";
import { offerService } from "@/modules/offers/offer.service";

describe("GRAPHQL SUBSYSTEM TEST SUITE", () => {
  test("GraphQL POST /graphql endpoint executes query via HTTP app.handle()", async () => {
    spyOn(movieService, "listMovies").mockImplementation(async () => [
      {
        id: "m-101",
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani",
        durationMinutes: 166,
        languages: ["English"],
        genres: ["Sci-Fi"],
        releaseDate: new Date(),
        rating: "PG-13",
        posterUrl: "https://example.com/poster.jpg",
        bannerUrl: "https://example.com/banner.jpg",
        isActive: true,
        createdAt: new Date(),
      },
    ]);

    const req = new Request("http://localhost:3000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            movies {
              id
              title
              genres
            }
          }
        `,
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data?: { movies?: unknown[] } };
    expect(body.data?.movies).toBeDefined();
  });

  test("GraphQL queries active bank offers via GraphQLService", async () => {
    spyOn(offerService, "listActiveOffers").mockImplementation(async () => [
      {
        id: "o-201",
        title: "bKash 10% Instant Cashback",
        description: "10% cashback",
        type: "BANK_CASHBACK",
        paymentMethod: "BKASH",
        discountPercentage: 10,
        freeSeatsCount: null,
        maxDiscountMinor: 15000,
        minOrderMinor: 30000,
        expiresAt: new Date(),
        isActive: true,
        createdAt: new Date(),
      },
    ]);

    const query = `
      query {
        offers {
          id
          title
          type
        }
      }
    `;

    const result = await graphqlService.execute(query);
    expect(result.errors).toBeUndefined();
    expect(result.data?.offers).toBeDefined();
  });
});
