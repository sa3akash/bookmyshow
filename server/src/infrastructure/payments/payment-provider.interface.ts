export interface PaymentIntentParams {
  bookingId: string;
  amountMinor: number;
  currency: string;
  description?: string;
}

export interface PaymentIntent {
  paymentId: string;
  transactionId: string;
  provider: string;
  clientSecret?: string;
  paymentUrl?: string;
  amountMinor: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

export interface PaymentResult {
  verified: boolean;
  status: "SUCCESS" | "FAILED" | "PENDING";
  transactionId: string;
  amountMinor: number;
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  refundId: string;
  status: "SUCCESS" | "FAILED";
  amountMinor: number;
  providerRefundId: string;
}

export interface WebhookSecurityParams {
  rawBody: string;
  signature: string;
  timestamp?: string;
  eventId?: string;
}

export interface PaymentProvider {
  readonly providerName: string;
  createPayment(params: PaymentIntentParams): Promise<PaymentIntent>;
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refundPayment(params: { paymentId: string; amountMinor: number; reason?: string }): Promise<RefundResult>;
  handleWebhook(params: WebhookSecurityParams): Promise<PaymentResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
