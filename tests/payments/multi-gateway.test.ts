import { describe, expect, test } from "bun:test";
import { PaymentProviderFactory } from "@/infrastructure/payments/payment-provider.factory";
import { BkashPaymentProvider } from "@/infrastructure/payments/bkash-payment.provider";
import { StripePaymentProvider } from "@/infrastructure/payments/stripe-payment.provider";
import { RazorpayPaymentProvider } from "@/infrastructure/payments/razorpay-payment.provider";
import { SslCommerzPaymentProvider } from "@/infrastructure/payments/sslcommerz-payment.provider";
import { NagadPaymentProvider } from "@/infrastructure/payments/nagad-payment.provider";
import { PayPalPaymentProvider } from "@/infrastructure/payments/paypal-payment.provider";

describe("MULTI-GATEWAY PAYMENT SUBSYSTEM VERIFICATION", () => {
  test("Factory retrieves bKash, Stripe, Razorpay, PayPal, SSLCommerz, Nagad, and Mock payment adapters correctly", () => {
    const bkash = PaymentProviderFactory.getProvider("BKASH");
    const stripe = PaymentProviderFactory.getProvider("STRIPE");
    const razorpay = PaymentProviderFactory.getProvider("RAZORPAY");
    const paypal = PaymentProviderFactory.getProvider("PAYPAL");
    const sslcommerz = PaymentProviderFactory.getProvider("SSLCOMMERZ");
    const nagad = PaymentProviderFactory.getProvider("NAGAD");
    const mockProvider = PaymentProviderFactory.getProvider("MOCK");

    expect(bkash).toBeInstanceOf(BkashPaymentProvider);
    expect(stripe).toBeInstanceOf(StripePaymentProvider);
    expect(razorpay).toBeInstanceOf(RazorpayPaymentProvider);
    expect(paypal).toBeInstanceOf(PayPalPaymentProvider);
    expect(sslcommerz).toBeInstanceOf(SslCommerzPaymentProvider);
    expect(nagad).toBeInstanceOf(NagadPaymentProvider);
    expect(mockProvider.providerName).toBe("MOCK");
  });

  test("bKash Payment Intent creation returns valid payment tokenized payload", async () => {
    const bkash = PaymentProviderFactory.getProvider("BKASH");
    const intent = await bkash.createPayment({
      bookingId: crypto.randomUUID(),
      amountMinor: 50000,
      currency: "BDT",
    });

    expect(intent.provider).toBe("BKASH");
    expect(intent.amountMinor).toBe(50000);
    expect(intent.clientSecret).toBeDefined();
    expect(bkash.verifyWebhookSignature("{}", "valid_bkash_signature")).toBe(true);

    const verification = await bkash.verifyPayment(intent.transactionId);
    expect(verification.verified).toBe(true);
    expect(verification.status).toBe("SUCCESS");
  });

  test("Stripe Payment Intent creation returns clientSecret and signature check", async () => {
    const stripe = PaymentProviderFactory.getProvider("STRIPE");
    const intent = await stripe.createPayment({
      bookingId: crypto.randomUUID(),
      amountMinor: 10000,
      currency: "USD",
    });

    expect(intent.provider).toBe("STRIPE");
    expect(intent.clientSecret).toContain("secret");
    expect(stripe.verifyWebhookSignature("{}", "valid_stripe_signature")).toBe(true);
  });

  test("Razorpay Payment Intent creation returns orderId", async () => {
    const razorpay = PaymentProviderFactory.getProvider("RAZORPAY");
    const intent = await razorpay.createPayment({
      bookingId: crypto.randomUUID(),
      amountMinor: 30000,
      currency: "INR",
    });

    expect(intent.provider).toBe("RAZORPAY");
    expect(intent.transactionId).toContain("order_rzp_");
  });

  test("PayPal Payment Intent creation returns approval token and verifies payment", async () => {
    const paypal = PaymentProviderFactory.getProvider("PAYPAL");
    const intent = await paypal.createPayment({
      bookingId: crypto.randomUUID(),
      amountMinor: 2500,
      currency: "USD",
    });

    expect(intent.provider).toBe("PAYPAL");
    expect(intent.clientSecret).toContain("paypal_approval_token_");

    const verification = await paypal.verifyPayment(intent.transactionId);
    expect(verification.verified).toBe(true);
  });

  test("Nagad Encrypted Payment Intent creation returns transaction token", async () => {
    const nagad = PaymentProviderFactory.getProvider("NAGAD");
    const intent = await nagad.createPayment({
      bookingId: crypto.randomUUID(),
      amountMinor: 75000,
      currency: "BDT",
    });

    expect(intent.provider).toBe("NAGAD");
    expect(intent.clientSecret).toContain("nagad_payment_ref_");
  });
});
