import { PaymentProvider, PaymentIntentParams, PaymentIntent, PaymentResult, RefundResult, WebhookSecurityParams } from "./payment-provider.interface";

export class MockPaymentProvider implements PaymentProvider {
  readonly providerName = "MOCK";

  async createPayment(params: PaymentIntentParams): Promise<PaymentIntent> {
    return this.createPaymentIntent(params);
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    const transactionId = "TXN-MOCK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      paymentId: crypto.randomUUID(),
      transactionId,
      provider: this.providerName,
      clientSecret: "mock_secret_" + transactionId,
      amountMinor: params.amountMinor,
      currency: params.currency,
      status: "PENDING",
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      verified: true,
      status: "SUCCESS",
      transactionId,
      amountMinor: 5000,
    };
  }

  async refundPayment(params: { paymentId: string; amountMinor: number; reason?: string }): Promise<RefundResult> {
    return {
      refundId: crypto.randomUUID(),
      status: "SUCCESS",
      amountMinor: params.amountMinor,
      providerRefundId: "REFUND-MOCK-123",
    };
  }

  async handleWebhook(params: WebhookSecurityParams): Promise<PaymentResult> {
    return {
      verified: true,
      status: "SUCCESS",
      transactionId: "TXN-MOCK-WEBHOOK",
      amountMinor: 5000,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return signature === "valid_mock_signature" || signature.length > 5;
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
