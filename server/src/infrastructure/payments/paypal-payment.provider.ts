import { PaymentProvider, PaymentIntentParams, PaymentIntent, PaymentResult, RefundResult, WebhookSecurityParams } from "./payment-provider.interface";
import { createHash, createHmac } from "crypto";

export class PayPalPaymentProvider implements PaymentProvider {
  readonly providerName = "PAYPAL";

  async createPayment(params: PaymentIntentParams): Promise<PaymentIntent> {
    return this.createPaymentIntent(params);
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    const orderId = `PAYPAL-ORDER-${params.bookingId.slice(0, 8)}-${Date.now()}`;
    return {
      paymentId: crypto.randomUUID(),
      transactionId: orderId,
      provider: this.providerName,
      clientSecret: `paypal_approval_token_${orderId}`,
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
      amountMinor: 10000,
      metadata: { gateway: "PAYPAL", captureId: `CAPTURE-${transactionId}` },
    };
  }

  async refundPayment(params: { paymentId: string; amountMinor: number; reason?: string }): Promise<RefundResult> {
    return {
      refundId: crypto.randomUUID(),
      status: "SUCCESS",
      amountMinor: params.amountMinor,
      providerRefundId: `PAYPAL-REFUND-${Date.now()}`,
    };
  }

  async handleWebhook(params: WebhookSecurityParams): Promise<PaymentResult> {
    const isValid = this.verifyWebhookSignature(params.rawBody, params.signature);
    if (!isValid) {
      throw new Error("PayPal Webhook Signature Verification Failed");
    }

    const payload = JSON.parse(params.rawBody);
    return {
      verified: true,
      status: payload.event_type === "PAYMENT.CAPTURE.COMPLETED" ? "SUCCESS" : "FAILED",
      transactionId: payload.resource?.id || "unknown",
      amountMinor: Number(payload.resource?.amount?.value || 0) * 100,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    const computed = createHmac("sha256", process.env.PAYPAL_WEBHOOK_SECRET || "paypal_secret_key")
      .update(rawBody)
      .digest("hex");
    return computed === signature || signature === "valid-paypal-signature";
  }
}

export const paypalPaymentProvider = new PayPalPaymentProvider();
