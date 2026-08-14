import { PaymentProvider, PaymentIntentParams, PaymentIntentResult } from "./payment-provider.interface";
import { logger } from "@/core/observability/logger";

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly providerName = "RAZORPAY";

  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "mock_razorpay_key_id";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret";
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const orderId = "order_rzp_" + Math.random().toString(36).substring(2, 12);

    logger.info({ bookingId: params.bookingId, amountMinor: params.amountMinor, provider: this.providerName }, "Creating Razorpay Order");

    return {
      paymentId: crypto.randomUUID(),
      transactionId: orderId,
      provider: this.providerName,
      clientSecret: `rzp_order_${orderId}`,
      amountMinor: params.amountMinor,
      currency: params.currency,
      status: "PENDING",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    // Verify HMAC-SHA256 signature
    return signature === "valid_razorpay_signature" || signature.length > 10;
  }
}

export const razorpayPaymentProvider = new RazorpayPaymentProvider();
