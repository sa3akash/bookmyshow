import { MoviePerformanceWeighting, DEFAULT_MOVIE_WEIGHTING } from "../../analytics.types";

export interface RawMoviePerformanceMetrics {
  views: number;
  bookings: number;
  revenueMinor: number;
  occupancyRate: number; // 0 to 100
  rating: number; // 0 to 10
  growthRate: number; // percentage
}

export class MovieScoringEngine {
  private weighting: MoviePerformanceWeighting;

  constructor(weighting: MoviePerformanceWeighting = DEFAULT_MOVIE_WEIGHTING) {
    this.weighting = { ...weighting };
  }

  public getWeighting(): MoviePerformanceWeighting {
    return { ...this.weighting };
  }

  public setWeighting(newWeighting: Partial<MoviePerformanceWeighting>): MoviePerformanceWeighting {
    this.weighting = {
      ...this.weighting,
      ...newWeighting,
    };
    return this.getWeighting();
  }

  public validateWeighting(weighting: MoviePerformanceWeighting): boolean {
    const total =
      weighting.viewsWeight +
      weighting.bookingsWeight +
      weighting.revenueWeight +
      weighting.occupancyWeight +
      weighting.ratingWeight +
      weighting.growthWeight;

    return Math.abs(total - 1.0) < 0.05;
  }

  public calculateScore(metrics: RawMoviePerformanceMetrics): number {
    // Normalize individual metric components to 0-100 scale
    const viewsScore = Math.min(100, (metrics.views / 1000) * 100);
    const bookingScore = Math.min(100, (metrics.bookings / 500) * 100);
    const revenueScore = Math.min(100, (metrics.revenueMinor / 10000000) * 100);
    const occupancyScore = Math.min(100, Math.max(0, metrics.occupancyRate));
    const ratingScore = Math.min(100, Math.max(0, metrics.rating * 10));
    const growthScore = Math.min(100, Math.max(0, metrics.growthRate));

    // Dynamic weighted calculation: performance_score = ∑ (metric_score * metric_weight)
    const finalScore =
      viewsScore * this.weighting.viewsWeight +
      bookingScore * this.weighting.bookingsWeight +
      revenueScore * this.weighting.revenueWeight +
      occupancyScore * this.weighting.occupancyWeight +
      ratingScore * this.weighting.ratingWeight +
      growthScore * this.weighting.growthWeight;

    return Number(finalScore.toFixed(2));
  }
}

export const movieScoringEngine = new MovieScoringEngine();
