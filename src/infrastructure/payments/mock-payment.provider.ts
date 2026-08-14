import { PaymentProvider, PaymentIntentParams, PaymentIntentResult } from "./payment-provider.interface";

export class MockPaymentProvider implements PaymentProvider {
  readonly providerName = "MOCK";

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
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

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    // Mock signature verification logic
    return signature === "valid_mock_signature" || signature.length > 5;
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
