export interface BaseDomainEvent<TName extends string, TPayload> {
  specVersion: "1.0";
  eventType: TName;
  aggregateType: string;
  aggregateId: string;
  eventId: string;
  timestamp: string;
  payload: TPayload;
}

// 1. Booking Created Event (v1)
export type BookingCreatedEvent = BaseDomainEvent<
  "booking.created.v1",
  {
    bookingId: string;
    userId: string;
    showId: string;
    seatIds: string[];
    totalAmountMinor: number;
    expiresAt: string;
  }
>;

// 2. Payment Initiated Event (v1)
export type PaymentInitiatedEvent = BaseDomainEvent<
  "payment.initiated.v1",
  {
    paymentId: string;
    bookingId: string;
    userId: string;
    provider: string;
    amountMinor: number;
  }
>;

// 3. Payment Succeeded Event (v1)
export type PaymentSucceededEvent = BaseDomainEvent<
  "payment.succeeded.v1",
  {
    paymentId: string;
    bookingId: string;
    userId: string;
    transactionReference: string;
    amountMinor: number;
  }
>;

// 4. Booking Confirmed Event (v1)
export type BookingConfirmedEvent = BaseDomainEvent<
  "booking.confirmed.v1",
  {
    bookingId: string;
    userId: string;
    showId: string;
    seatIds: string[];
    confirmedAt: string;
  }
>;

// 5. Ticket Issued Event (v1)
export type TicketIssuedEvent = BaseDomainEvent<
  "ticket.issued.v1",
  {
    ticketId: string;
    ticketNumber: string;
    bookingId: string;
    userId: string;
    qrCodeData: string;
  }
>;

// 6. Booking Cancelled Event (v1)
export type BookingCancelledEvent = BaseDomainEvent<
  "booking.cancelled.v1",
  {
    bookingId: string;
    userId: string;
    reason: string;
    cancelledAt: string;
  }
>;

// 7. Refund Created Event (v1)
export type RefundCreatedEvent = BaseDomainEvent<
  "refund.created.v1",
  {
    refundId: string;
    bookingId: string;
    userId: string;
    amountMinor: number;
    reason: string;
  }
>;

export type DomainEvent =
  | BookingCreatedEvent
  | PaymentInitiatedEvent
  | PaymentSucceededEvent
  | BookingConfirmedEvent
  | TicketIssuedEvent
  | BookingCancelledEvent
  | RefundCreatedEvent;
