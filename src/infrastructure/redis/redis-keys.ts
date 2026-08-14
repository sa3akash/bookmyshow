export const RedisKeys = {
  /**
   * User profile & session keys
   * TTL: 7 days (session)
   */
  userSession: (userId: string) => `user:${userId}:session`,

  /**
   * Movie details cache
   * TTL: 1 hour (3600s)
   */
  movieDetail: (movieId: string) => `movie:${movieId}`,

  /**
   * Show details cache
   * TTL: 15 minutes (900s)
   */
  showDetail: (showId: string) => `show:${showId}`,

  /**
   * Show seat layout blueprint cache
   * TTL: 24 hours (86400s)
   */
  showSeatsLayout: (showId: string) => `show:${showId}:seats`,

  /**
   * Temporary seat lock key
   * TTL: 10 minutes (600s)
   */
  seatLock: (showId: string, seatId: string) => `seat-lock:${showId}:${seatId}`,

  /**
   * Booking details cache
   * TTL: 15 minutes (900s)
   */
  bookingDetail: (bookingId: string) => `booking:${bookingId}`,

  /**
   * OTP verification code key
   * TTL: 5 minutes (300s)
   */
  otpCode: (channel: "sms" | "email", identifier: string) => `otp:${channel}:${identifier}`,

  /**
   * Rate limiting key
   * TTL: 60 seconds (60s)
   */
  rateLimit: (category: string, identifier: string) => `ratelimit:${category}:${identifier}`,

  /**
   * Idempotency check key
   * TTL: 24 hours (86400s)
   */
  idempotencyKey: (key: string) => `idempotency:${key}`,
};

export const RedisTTL = {
  OTP: 300, // 5 minutes
  SEAT_LOCK: 600, // 10 minutes
  SHOWTIME: 900, // 15 minutes
  RATE_LIMIT: 60, // 1 minute
  MOVIE_DETAIL: 3600, // 1 hour
  SESSION: 604800, // 7 days
  IDEMPOTENCY: 86400, // 24 hours
};
