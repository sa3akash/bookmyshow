import { Elysia, t } from "elysia";
import { searchService } from "../service/search.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const searchController = new Elysia({ prefix: "/api/v1/search" })
  .get(
    "/",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const results = await searchService.searchCatalog({
        query: query.q,
        genre: query.genre,
        language: query.language,
        cityId: query.cityId,
        type: query.type as "MOVIE" | "VENUE" | undefined,
        limit: query.limit ? Number(query.limit) : 20,
        offset: query.offset ? Number(query.offset) : 0,
      });
      return successResponse(results, undefined, requestId);
    },
    {
      query: t.Object({
        q: t.String({ minLength: 1 }),
        genre: t.Optional(t.String()),
        language: t.Optional(t.String()),
        cityId: t.Optional(t.String()),
        type: t.Optional(t.Union([t.Literal("MOVIE"), t.Literal("VENUE")])),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      detail: { tags: ["Search"], summary: "OpenSearch catalog search (movies, actors, directors, venues, cities with fuzzy search & typo tolerance)" },
    }
  )
  .get(
    "/autocomplete",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const suggestions = await searchService.autocomplete(query.q);
      return successResponse(suggestions, undefined, requestId);
    },
    {
      query: t.Object({ q: t.String({ minLength: 1 }) }),
      detail: { tags: ["Search"], summary: "Sub-second OpenSearch autocomplete suggestions as user types" },
    }
  )
  .post(
    "/reindex",
    async ({ request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("admin:reconcile");
      const summary = await searchService.triggerReindex();
      return successResponse(summary, undefined, requestId);
    },
    {
      detail: { tags: ["Search"], summary: "Trigger full OpenSearch catalog bulk reindexing pipeline (admin permission)" },
    }
  );
