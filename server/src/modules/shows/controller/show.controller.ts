import { Elysia, t } from "elysia";
import { showService } from "../service/show.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const showController = new Elysia({ prefix: "/api/v1" })
  .get(
    "/movies/:id/shows",
    async ({ params, query, request }) => {
      const { requestId } = getRequestContext(request);
      const showsList = await showService.getShowsForMovie(params.id, query.cityId);
      return successResponse(showsList, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({ cityId: t.Optional(t.String()) }),
      detail: { tags: ["Shows"], summary: "Get showtimes for a movie" },
    }
  )
  .get(
    "/shows/:showId/seats",
    async ({ params, request }) => {
      const { requestId } = getRequestContext(request);
      const seatMap = await showService.getShowSeatMap(params.showId);
      return successResponse(seatMap, undefined, requestId);
    },
    {
      params: t.Object({ showId: t.String() }),
      detail: { tags: ["Shows"], summary: "Get seat layout & real-time seat status for a show" },
    }
  )
  .post(
    "/shows",
    async ({ body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("show:create");
      const show = await showService.createShow({
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      });
      return successResponse(show, undefined, requestId);
    },
    {
      body: t.Object({
        movieId: t.String(),
        screenId: t.String(),
        startTime: t.String(),
        endTime: t.String(),
        language: t.String(),
        format: t.String(),
        basePriceMinor: t.Number(),
      }),
      detail: { tags: ["Shows"], summary: "Schedule a show with overlap prevention (show:create permission)" },
    }
  );
