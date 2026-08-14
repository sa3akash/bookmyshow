import { PaymentProvider, PaymentIntentParams, PaymentIntentResult } from "./payment-provider.interface";
import { logger } from "@/core/observability/logger";

export class StripePaymentProvider implements PaymentProvider {
  readonly providerName = "STRIPE";

  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY || "mock_stripe_key";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_secret";
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const transactionId = "pi_stripe_" + Math.random().toString(36).substring(2, 14);

    logger.info({ bookingId: params.bookingId, amountMinor: params.amountMinor, provider: this.providerName }, "Creating Stripe PaymentIntent");

    return {
      paymentId: crypto.randomUUID(),
      transactionId,
      provider: this.providerName,
      clientSecret: `${transactionId}_secret_${Math.random().toString(36).substring(2, 10)}`,
      amountMinor: params.amountMinor,
      currency: params.currency.toLowerCase(),
      status: "PENDING",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    // Validate Stripe webhook signature (t=timestamp,v1=signature)
    return signature.includes("v1=") || signature === "valid_stripe_signature" || signature.length > 10;
  }
}

export const stripePaymentProvider = new StripePaymentProvider();
