export abstract class AppError extends Error {
  abstract readonly httpStatus: number;
  abstract readonly code: string;
  readonly metadata?: Record<string, unknown>;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.metadata = metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  readonly httpStatus = 400;
  readonly code = "VALIDATION_ERROR";
}

export class AuthenticationError extends AppError {
  readonly httpStatus = 401;
  readonly code = "AUTHENTICATION_ERROR";
}

export class AuthorizationError extends AppError {
  readonly httpStatus = 403;
  readonly code = "AUTHORIZATION_ERROR";
}

export class ForbiddenError extends AppError {
  readonly httpStatus = 403;
  readonly code = "FORBIDDEN";
}

export class NotFoundError extends AppError {
  readonly httpStatus = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictError extends AppError {
  readonly httpStatus = 409;
  readonly code = "CONFLICT_ERROR";
}

export class RateLimitError extends AppError {
  readonly httpStatus = 429;
  readonly code = "RATE_LIMITED";
}

export class TooManyRequestsError extends AppError {
  readonly httpStatus = 429;
  readonly code = "TOO_MANY_REQUESTS";
}

export class SeatUnavailableError extends AppError {
  readonly httpStatus = 409;
  readonly code = "SEAT_ALREADY_HELD_OR_BOOKED";
}

export class BookingError extends AppError {
  readonly httpStatus = 400;
  readonly code = "BOOKING_ERROR";
}

export class PaymentError extends AppError {
  readonly httpStatus = 402;
  readonly code = "PAYMENT_FAILED";
}

export class ExternalServiceError extends AppError {
  readonly httpStatus = 502;
  readonly code = "EXTERNAL_SERVICE_ERROR";
}

export class DatabaseError extends AppError {
  readonly httpStatus = 500;
  readonly code = "DATABASE_ERROR";
}
