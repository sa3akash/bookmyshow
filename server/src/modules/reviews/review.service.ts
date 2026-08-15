import { db } from "@/infrastructure/database/client";
import { reviews, movies, users } from "@/infrastructure/database/schema";
import { eq, avg, count, and } from "drizzle-orm";
import { NotFoundError, ConflictError } from "@/core/errors/app-error";

export class ReviewService {
  async addReview(userId: string, movieId: string, rating: number, comment?: string) {
    const movie = await db.query.movies.findFirst({
      where: eq(movies.id, movieId),
    });

    if (!movie) {
      throw new NotFoundError(`Movie ${movieId} not found`);
    }

    // Check if user already reviewed
    const existing = await db.query.reviews.findFirst({
      where: and(eq(reviews.movieId, movieId), eq(reviews.userId, userId)),
    });

    if (existing) {
      throw new ConflictError("You have already reviewed this movie");
    }

    const [inserted] = await db
      .insert(reviews)
      .values({
        movieId,
        userId,
        rating,
        comment,
      })
      .returning();

    return inserted;
  }

  async getMovieReviews(movieId: string) {
    const movieReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userFullName: users.fullName,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.movieId, movieId));

    const stats = await db
      .select({
        avgRating: avg(reviews.rating),
        totalCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.movieId, movieId));

    return {
      averageRating: stats[0]?.avgRating ? parseFloat(parseFloat(stats[0].avgRating).toFixed(1)) : 0,
      totalReviews: stats[0]?.totalCount ? Number(stats[0].totalCount) : 0,
      reviews: movieReviews,
    };
  }
}

export const reviewService = new ReviewService();
