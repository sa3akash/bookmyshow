import { Elysia, t } from "elysia";
import { eventService } from "./event.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const eventController = new Elysia({ prefix: "/api/v1/events" })
  .get(
    "/",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const eventList = await eventService.listEvents(query.category, query.cityId);
      return successResponse(eventList, undefined, requestId);
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        cityId: t.Optional(t.String()),
      }),
      detail: { tags: ["Events"], summary: "List live concerts, comedy shows, sports matches, and events" },
    }
  )
  .get(
    "/:id",
    async ({ params, request }) => {
      const { requestId } = getRequestContext(request);
      const eventDetails = await eventService.getEventDetails(params.id);
      return successResponse(eventDetails, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Events"], summary: "Get detailed event info with performers and ticket pricing tiers" },
    }
  )
  .post(
    "/",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const created = await eventService.createEvent({
        ...body,
        slots: body.slots?.map((s) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
        })),
      });
      return successResponse(created, undefined, requestId);
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        category: t.Union([
          t.Literal("CONCERT"),
          t.Literal("COMEDY"),
          t.Literal("SPORTS"),
          t.Literal("THEATRE"),
          t.Literal("WORKSHOP"),
        ]),
        venueName: t.String(),
        address: t.Optional(t.String()),
        bannerUrl: t.Optional(t.String()),
        posterUrl: t.Optional(t.String()),
        cityId: t.Optional(t.String()),
        performers: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              role: t.Optional(t.String()),
              imageUrl: t.Optional(t.String()),
            })
          )
        ),
        slots: t.Optional(
          t.Array(
            t.Object({
              startTime: t.String(),
              endTime: t.String(),
              tierName: t.String(),
              priceMinor: t.Number(),
              totalSeats: t.Number(),
            })
          )
        ),
      }),
      detail: { tags: ["Events"], summary: "Create new live event, concert, or sports match (Admin only)" },
    }
  );
