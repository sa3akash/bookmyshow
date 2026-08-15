import { Elysia, t } from "elysia";
import { movieService } from "../service/movie.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const movieController = new Elysia({ prefix: "/api/v1/movies" })
  .get(
    "/",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const movies = await movieService.listMovies({
        cityId: query.cityId,
        genre: query.genre,
        language: query.language,
        status: query.status as "NOW_SHOWING" | "UPCOMING" | undefined,
      });
      return successResponse(movies, undefined, requestId);
    },
    {
      query: t.Object({
        cityId: t.Optional(t.String()),
        genre: t.Optional(t.String()),
        language: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal("NOW_SHOWING"), t.Literal("UPCOMING")])),
      }),
      detail: { tags: ["Movies"], summary: "List movies with filters for city, genre, language, and release status" },
    }
  )
  .get(
    "/:id",
    async ({ params, request }) => {
      const { requestId } = getRequestContext(request);
      const movie = await movieService.getMovieById(params.id);
      return successResponse(movie, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Movies"], summary: "Get detailed movie profile with cast, crew, trailers, and media gallery" },
    }
  )
  .post(
    "/",
    async ({ body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("movie:create");
      const movie = await movieService.createMovie({
        title: body.title,
        description: body.description,
        durationMinutes: body.durationMinutes,
        languages: body.languages,
        genres: body.genres,
        releaseDate: new Date(body.releaseDate),
        rating: body.rating,
        posterUrl: body.posterUrl,
        bannerUrl: body.bannerUrl,
        cast: body.cast,
        crew: body.crew,
        media: body.media as Array<{ type: "TRAILER" | "BACKDROP" | "GALLERY" | "CLIP"; url: string; title?: string }> | undefined,
      });
      return successResponse(movie, undefined, requestId);
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        durationMinutes: t.Number({ minimum: 1 }),
        languages: t.Array(t.String()),
        genres: t.Array(t.String()),
        releaseDate: t.String(),
        rating: t.Optional(t.String()),
        posterUrl: t.Optional(t.String()),
        bannerUrl: t.Optional(t.String()),
        cast: t.Optional(
          t.Array(
            t.Object({
              actorName: t.String(),
              characterName: t.Optional(t.String()),
              profileImageUrl: t.Optional(t.String()),
              roleType: t.Optional(t.String()),
            })
          )
        ),
        crew: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              jobTitle: t.String(),
            })
          )
        ),
        media: t.Optional(
          t.Array(
            t.Object({
              type: t.Union([t.Literal("TRAILER"), t.Literal("BACKDROP"), t.Literal("GALLERY"), t.Literal("CLIP")]),
              url: t.String(),
              title: t.Optional(t.String()),
            })
          )
        ),
      }),
      detail: { tags: ["Movies"], summary: "Create new movie entry with cast, crew, and media trailers (movie:create permission)" },
    }
  );
