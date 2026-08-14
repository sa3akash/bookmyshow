import { Elysia, t } from "elysia";
import { searchService } from "../search.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const searchController = new Elysia({ prefix: "/api/v1/search" })
  .get(
    "/",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const results = await searchService.searchCatalog(query.q, query.cityId);
      return successResponse(results, undefined, requestId);
    },
    {
      query: t.Object({
        q: t.String({ minLength: 1 }),
        cityId: t.Optional(t.String()),
      }),
      detail: { tags: ["Search"], summary: "Full-text search for movies and venues" },
    }
  );
