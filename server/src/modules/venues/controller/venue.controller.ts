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
    },
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
    },
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
    },
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
      detail: {
        tags: ["Venues"],
        summary: "Create a new venue (Venue Manager only)",
      },
    },
  )
  .get(
    "/screens/:screenId/layout",
    async ({ params, request }) => {
      const { requestId } = getRequestContext(request);
      const layout = await venueService.getScreenLayout(params.screenId);
      return successResponse(layout, undefined, requestId);
    },
    {
      params: t.Object({
        screenId: t.String(),
      }),
      detail: {
        tags: ["Venues"],
        summary: "Get current seat layout and screen configuration",
      },
    },
  )
  .post(
    "/screens/layout",
    async ({ body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("venue:update");
      const result = await venueService.createScreenWithLayout(body);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        screenId: t.Optional(t.String()),
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
          }),
        ),
      }),
      detail: {
        tags: ["Venues"],
        summary: "Create or update a screen and synchronize seat layout via upsert",
      },
    },
  )
  .patch(
    "/venues/:id",
    async ({ params, body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("venue:update");
      const updated = await venueService.updateVenue(params.id, body);
      return successResponse(updated, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        address: t.Optional(t.String()),
        amenities: t.Optional(t.Array(t.String())),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: { tags: ["Venues"], summary: "Update venue details" },
    }
  )
  .delete(
    "/venues/:id",
    async ({ params, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("venue:delete");
      const deleted = await venueService.deleteVenue(params.id);
      return successResponse(deleted, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Venues"], summary: "Delete (soft delete) a venue" },
    }
  )
  .patch(
    "/screens/:id",
    async ({ params, body, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("screen:update");
      const updated = await venueService.updateScreen(params.id, body);
      return successResponse(updated, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        supportedFormats: t.Optional(t.Array(t.String())),
        totalSeats: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: { tags: ["Venues"], summary: "Update screen details" },
    }
  )
  .delete(
    "/screens/:id",
    async ({ params, request }) => {
      const { requirePermission, requestId } = getRequestContext(request);
      requirePermission("screen:update");
      const deleted = await venueService.deleteScreen(params.id);
      return successResponse(deleted, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Venues"], summary: "Delete (soft delete) a screen" },
    }
  );
