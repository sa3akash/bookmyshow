import { describe, expect, test } from "bun:test";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  PaymentError,
  BookingError,
  SeatUnavailableError,
  ExternalServiceError,
  DatabaseError,
} from "@/core/errors/app-error";
import { errorResponse } from "@/core/types/api-response";

describe("TYPED APPLICATION ERROR SYSTEM TEST SUITE", () => {
  test("ValidationError exposes code, message, httpStatus=400, and metadata", () => {
    const err = new ValidationError("Invalid email format", { field: "email" });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.httpStatus).toBe(400);
    expect(err.message).toBe("Invalid email format");
    expect(err.metadata).toEqual({ field: "email" });
  });

  test("AuthenticationError exposes httpStatus=401", () => {
    const err = new AuthenticationError("Invalid credentials");
    expect(err.code).toBe("AUTHENTICATION_ERROR");
    expect(err.httpStatus).toBe(401);
  });

  test("AuthorizationError exposes httpStatus=403", () => {
    const err = new AuthorizationError("Permission required");
    expect(err.code).toBe("AUTHORIZATION_ERROR");
    expect(err.httpStatus).toBe(403);
  });

  test("NotFoundError exposes httpStatus=404", () => {
    const err = new NotFoundError("Movie profile not found");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.httpStatus).toBe(404);
  });

  test("ConflictError exposes httpStatus=409", () => {
    const err = new ConflictError("User already exists");
    expect(err.code).toBe("CONFLICT_ERROR");
    expect(err.httpStatus).toBe(409);
  });

  test("RateLimitError exposes httpStatus=429", () => {
    const err = new RateLimitError("Rate limit exceeded");
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.httpStatus).toBe(429);
  });

  test("PaymentError exposes httpStatus=402", () => {
    const err = new PaymentError("Card declined", { gateway: "STRIPE" });
    expect(err.code).toBe("PAYMENT_FAILED");
    expect(err.httpStatus).toBe(402);
  });

  test("BookingError exposes httpStatus=400", () => {
    const err = new BookingError("Invalid show selected");
    expect(err.code).toBe("BOOKING_ERROR");
    expect(err.httpStatus).toBe(400);
  });

  test("SeatUnavailableError exposes httpStatus=409", () => {
    const err = new SeatUnavailableError("Seat A1 already held");
    expect(err.code).toBe("SEAT_ALREADY_HELD_OR_BOOKED");
    expect(err.httpStatus).toBe(409);
  });

  test("ExternalServiceError exposes httpStatus=502", () => {
    const err = new ExternalServiceError("bKash gateway down");
    expect(err.code).toBe("EXTERNAL_SERVICE_ERROR");
    expect(err.httpStatus).toBe(502);
  });

  test("DatabaseError exposes httpStatus=500", () => {
    const err = new DatabaseError("Query timeout");
    expect(err.code).toBe("DATABASE_ERROR");
    expect(err.httpStatus).toBe(500);
  });

  test("errorResponse NEVER exposes stack traces in production JSON response", () => {
    const response = errorResponse("PAYMENT_FAILED", "Transaction declined", { attempt: 1 }, "req-123");
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe("PAYMENT_FAILED");
    expect(response.error?.message).toBe("Transaction declined");
    expect(response.error?.details).toEqual({ attempt: 1 });
    expect((response as any).stack).toBeUndefined();
    expect((response.error as any)?.stack).toBeUndefined();
  });
});
