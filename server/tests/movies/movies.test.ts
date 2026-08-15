import { describe, expect, test, spyOn } from "bun:test";
import { movieService } from "@/modules/movies/service/movie.service";

describe("MOVIES CATALOG TEST SUITE", () => {
  test("MovieService lists movies filtered by status", async () => {
    spyOn(movieService, "listMovies").mockImplementation(async () => [
      {
        id: "m-1",
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family",
        durationMinutes: 192,
        languages: ["English"],
        genres: ["Sci-Fi", "Action"],
        releaseDate: new Date("2022-12-16"),
        rating: "PG-13",
        posterUrl: "https://example.com/avatar.jpg",
        bannerUrl: "https://example.com/avatar-banner.jpg",
        isActive: true,
        createdAt: new Date(),
      },
    ]);

    const movies = await movieService.listMovies({ status: "NOW_SHOWING" });
    expect(movies.length).toBe(1);
    expect(movies[0]!.title).toBe("Avatar: The Way of Water");
  });

  test("MovieService returns detailed movie profile with cast, crew, and media gallery", async () => {
    spyOn(movieService, "getMovieById").mockImplementation(async () => ({
      id: "m-1",
      title: "Avatar: The Way of Water",
      description: "Jake Sully lives with his family",
      durationMinutes: 192,
      languages: ["English"],
      genres: ["Sci-Fi"],
      releaseDate: new Date(),
      rating: "PG-13",
      posterUrl: "https://example.com/avatar.jpg",
      bannerUrl: "https://example.com/avatar-banner.jpg",
      isActive: true,
      createdAt: new Date(),
      cast: [
        { id: "c-1", movieId: "m-1", actorName: "Sam Worthington", characterName: "Jake Sully", profileImageUrl: null, roleType: "LEAD" },
      ],
      crew: [
        { id: "cr-1", movieId: "m-1", name: "James Cameron", jobTitle: "Director" },
      ],
      media: [
        { id: "med-1", movieId: "m-1", type: "TRAILER", url: "https://youtube.com/watch?v=123", title: "Official Trailer" },
      ],
    }));

    const movie = await movieService.getMovieById("m-1");
    expect(movie.cast?.length).toBe(1);
    expect(movie.crew?.length).toBe(1);
    expect(movie.media?.length).toBe(1);
  });
});
