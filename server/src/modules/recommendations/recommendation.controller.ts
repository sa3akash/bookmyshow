import { Elysia, t } from "elysia";
import { recommendationService } from "./recommendation.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const recommendationController = new Elysia({ prefix: "/api/v1/movies/recommendations" })
  .get(
    "/popular",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const limit = query.limit ? parseInt(query.limit, 10) : 6;
      const popular = await recommendationService.getPopularMovies(limit);
      return successResponse(popular, undefined, requestId);
    },
    {
      query: t.Object({ limit: t.Optional(t.String()) }),
      detail: { tags: ["Recommendations"], summary: "Get popular & trending movie recommendations" },
    }
  )
  .get(
    "/similar/:id",
    async ({ params, query, request }) => {
      const { requestId } = getRequestContext(request);
      const limit = query.limit ? parseInt(query.limit, 10) : 4;
      const similar = await recommendationService.getSimilarMovies(params.id, limit);
      return successResponse(similar, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({ limit: t.Optional(t.String()) }),
      detail: { tags: ["Recommendations"], summary: "Get genre-matched similar movie recommendations" },
    }
  );
