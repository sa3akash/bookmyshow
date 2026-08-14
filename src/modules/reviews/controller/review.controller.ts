import { Elysia, t } from "elysia";
import { reviewService } from "../review.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const reviewController = new Elysia({ prefix: "/api/v1/movies" })
  .get(
    "/:id/reviews",
    async ({ params, request }) => {
      const { requestId } = getRequestContext(request);
      const data = await reviewService.getMovieReviews(params.id);
      return successResponse(data, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Reviews"], summary: "Get user reviews and rating statistics for a movie" },
    }
  )
  .post(
    "/:id/reviews",
    async ({ params, body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const review = await reviewService.addReview(
        user.userId,
        params.id,
        body.rating,
        body.comment
      );
      return successResponse(review, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 10 }),
        comment: t.Optional(t.String()),
      }),
      detail: { tags: ["Reviews"], summary: "Submit a movie rating and review" },
    }
  );
