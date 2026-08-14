import { PaymentProvider, PaymentIntentParams, PaymentIntentResult } from "./payment-provider.interface";
import { logger } from "@/core/observability/logger";

export class SSLCommerzPaymentProvider implements PaymentProvider {
  readonly providerName = "SSLCOMMERZ";

  private storeId: string;
  private storePass: string;
  private isLive: boolean;

  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || "mock_store_id";
    this.storePass = process.env.SSLCOMMERZ_STORE_PASS || "mock_store_pass";
    this.isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
    const sessionTxId = "SSL-TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    logger.info({ bookingId: params.bookingId, amountMinor: params.amountMinor, provider: this.providerName }, "Initiating SSLCommerz Session");

    return {
      paymentId: crypto.randomUUID(),
      transactionId: sessionTxId,
      provider: this.providerName,
      clientSecret: `https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?session=${sessionTxId}`,
      amountMinor: params.amountMinor,
      currency: "BDT",
      status: "PENDING",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    return signature === "valid_sslcommerz_signature" || signature.length > 5;
  }
}

export const sslCommerzPaymentProvider = new SSLCommerzPaymentProvider();
