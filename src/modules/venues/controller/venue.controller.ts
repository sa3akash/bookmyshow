import { Elysia, t } from "elysia";
import { venueService } from "../service/venue.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const venueController = new Elysia({ prefix: "/api/v1" })
  .get(
    "/cities",
    async ({ request }) => {
      const { requestId } = getRequestContext(request);
      const citiesList = await venueService.listCities();
      return successResponse(citiesList, undefined, requestId);
    },
    {
      detail: { tags: ["Venues"], summary: "List active cities" },
    }
  )
  .post(
    "/cities",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("ADMIN");
      const city = await venueService.createCity(body);
      return successResponse(city, undefined, requestId);
    },
    {
      body: t.Object({
        name: t.String(),
        state: t.Optional(t.String()),
        country: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
      }),
      detail: { tags: ["Venues"], summary: "Create a new city (Admin only)" },
    }
  )
  .get(
    "/venues",
    async ({ query, request }) => {
      const { requestId } = getRequestContext(request);
      const venuesList = await venueService.listVenuesByCity(query.cityId);
      return successResponse(venuesList, undefined, requestId);
    },
    {
      query: t.Object({
        cityId: t.String(),
      }),
      detail: { tags: ["Venues"], summary: "List venues by city ID" },
    }
  )
  .post(
    "/venues",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("VENUE_MANAGER");
      const venue = await venueService.createVenue(body);
      return successResponse(venue, undefined, requestId);
    },
    {
      body: t.Object({
        cityId: t.String(),
        name: t.String(),
        address: t.String(),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        amenities: t.Optional(t.Array(t.String())),
      }),
      detail: { tags: ["Venues"], summary: "Create a new venue (Venue Manager only)" },
    }
  )
  .post(
    "/screens/layout",
    async ({ body, request }) => {
      const { requireRole, requestId } = getRequestContext(request);
      requireRole("VENUE_MANAGER");
      const result = await venueService.createScreenWithLayout(body);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        venueId: t.String(),
        name: t.String(),
        supportedFormats: t.Optional(t.Array(t.String())),
        rows: t.Array(
          t.Object({
            rowLabel: t.String(),
            seatsCount: t.Number(),
            type: t.Optional(t.String()),
            category: t.Optional(t.String()),
            priceMultiplier: t.Optional(t.String()),
          })
        ),
      }),
      detail: { tags: ["Venues"], summary: "Create a screen and generate seat layout" },
    }
  );
