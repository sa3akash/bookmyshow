import { t } from "elysia";

export const chartQuerySchema = t.Object({
  period: t.Optional(t.Union([t.Literal("daily"), t.Literal("hourly")])),
});

export const exportRequestSchema = t.Object({
  reportType: t.String({ minLength: 1 }),
  format: t.Optional(t.Union([t.Literal("CSV"), t.Literal("JSON"), t.Literal("EXCEL")])),
});

export const analyticsFilterQuerySchema = t.Object({
  city: t.Optional(t.String()),
  venue: t.Optional(t.String()),
  screen: t.Optional(t.String()),
  movie: t.Optional(t.String()),
  genre: t.Optional(t.String()),
  language: t.Optional(t.String()),
  format: t.Optional(t.String()),
  payment_method: t.Optional(t.String()),
  payment_provider: t.Optional(t.String()),
  booking_status: t.Optional(t.String()),
  date_range: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});
