export interface PaymentIntentParams {
  bookingId: string;
  amountMinor: number;
  currency: string;
  description?: string;
}

export interface PaymentIntentResult {
  paymentId: string;
  transactionId: string;
  provider: string;
  clientSecret?: string;
  amountMinor: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

export interface PaymentProvider {
  readonly providerName: string;
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
