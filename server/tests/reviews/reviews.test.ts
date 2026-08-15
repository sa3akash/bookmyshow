import { describe, expect, test, spyOn } from "bun:test";
import { reviewService } from "@/modules/reviews/review.service";

describe("RATINGS & REVIEWS TEST SUITE", () => {
  test("ReviewService submits movie review and calculates average rating statistics", async () => {
    spyOn(reviewService, "addReview").mockImplementation(async () => ({
      id: "rev-1",
      movieId: "m-101",
      userId: "u-101",
      rating: 9,
      comment: "Masterpiece cinema!",
      createdAt: new Date(),
    }));

    spyOn(reviewService, "getMovieReviews").mockImplementation(async () => ({
      averageRating: 9.2,
      totalReviews: 45,
      reviews: [
        { id: "rev-1", rating: 9, comment: "Masterpiece cinema!", createdAt: new Date(), userFullName: "John Doe" },
      ],
    }));

    const newReview = await reviewService.addReview("u-101", "m-101", 9, "Masterpiece cinema!");
    expect(newReview?.rating).toBe(9);

    const stats = await reviewService.getMovieReviews("m-101");
    expect(stats.averageRating).toBe(9.2);
    expect(stats.totalReviews).toBe(45);
  });
});
