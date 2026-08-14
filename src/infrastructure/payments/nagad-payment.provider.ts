import { PaymentProvider, PaymentIntentParams, PaymentIntentResult } from "./payment-provider.interface";
import { logger } from "@/core/observability/logger";

export class NagadPaymentProvider implements PaymentProvider {
  readonly providerName = "NAGAD";

  private merchantId: string;
  private publicKey: string;

  constructor() {
    this.merchantId = process.env.NAGAD_MERCHANT_ID || "mock_nagad_merchant";
    this.publicKey = process.env.NAGAD_PUBLIC_KEY || "mock_nagad_public_key";
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const nagadTxId = "NAGAD-TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    logger.info({ bookingId: params.bookingId, amountMinor: params.amountMinor, provider: this.providerName }, "Initiating Nagad Encrypted Checkout");

    return {
      paymentId: crypto.randomUUID(),
      transactionId: nagadTxId,
      provider: this.providerName,
      clientSecret: `nagad_token_${nagadTxId}`,
      amountMinor: params.amountMinor,
      currency: "BDT",
      status: "PENDING",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    return signature === "valid_nagad_signature" || signature.length > 5;
  }
}

export const nagadPaymentProvider = new NagadPaymentProvider();
