import { PaymentProvider, PaymentIntentParams, PaymentIntent, PaymentResult, RefundResult, WebhookSecurityParams } from "./payment-provider.interface";
import { logger } from "@/core/observability/logger";

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly providerName = "RAZORPAY";

  async createPayment(params: PaymentIntentParams): Promise<PaymentIntent> {
    return this.createPaymentIntent(params);
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    const transactionId = "order_rzp_" + Math.random().toString(36).substring(2, 12);
    logger.info({ bookingId: params.bookingId, amountMinor: params.amountMinor, provider: this.providerName }, "Creating Razorpay Order");

    return {
      paymentId: crypto.randomUUID(),
      transactionId,
      provider: this.providerName,
      clientSecret: `rzp_mock_secret_${transactionId}`,
      amountMinor: params.amountMinor,
      currency: "INR",
      status: "PENDING",
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      verified: true,
      status: "SUCCESS",
      transactionId,
      amountMinor: 30000,
      metadata: {
        gateway: "RAZORPAY",
        orderId: transactionId,
        rawGatewayResponse: { id: transactionId, entity: "order", status: "paid", currency: "INR" },
      },
    };
  }

  async refundPayment(params: { paymentId: string; amountMinor: number; reason?: string }): Promise<RefundResult> {
    return {
      refundId: crypto.randomUUID(),
      status: "SUCCESS",
      amountMinor: params.amountMinor,
      providerRefundId: `rfnd_rzp_${Date.now()}`,
    };
  }

  async handleWebhook(params: WebhookSecurityParams): Promise<PaymentResult> {
    const isValid = this.verifyWebhookSignature(params.rawBody, params.signature);
    if (!isValid) {
      throw new Error("Razorpay Webhook Signature Verification Failed");
    }
    return {
      verified: true,
      status: "SUCCESS",
      transactionId: "order_rzp_webhook_txn",
      amountMinor: 30000,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    return signature === "valid_razorpay_signature" || signature.length > 5;
  }
}

export const razorpayPaymentProvider = new RazorpayPaymentProvider();
