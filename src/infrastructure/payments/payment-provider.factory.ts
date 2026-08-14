import { PaymentProvider } from "./payment-provider.interface";
import { bkashPaymentProvider } from "./bkash-payment.provider";
import { stripePaymentProvider } from "./stripe-payment.provider";
import { razorpayPaymentProvider } from "./razorpay-payment.provider";
import { sslCommerzPaymentProvider } from "./sslcommerz-payment.provider";
import { nagadPaymentProvider } from "./nagad-payment.provider";
import { mockPaymentProvider } from "./mock-payment.provider";

export class PaymentProviderFactory {
  private static providers = new Map<string, PaymentProvider>([
    ["BKASH", bkashPaymentProvider],
    ["STRIPE", stripePaymentProvider],
    ["RAZORPAY", razorpayPaymentProvider],
    ["SSLCOMMERZ", sslCommerzPaymentProvider],
    ["NAGAD", nagadPaymentProvider],
    ["MOCK", mockPaymentProvider],
  ]);

  static getProvider(providerName: string): PaymentProvider {
    const normalized = providerName.trim().toUpperCase();
    const provider = this.providers.get(normalized);
    if (!provider) {
      // Fallback to mock provider for unknown gateways
      return mockPaymentProvider;
    }
    return provider;
  }

  static registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.providerName.toUpperCase(), provider);
  }

  static getSupportedGateways(): string[] {
    return Array.from(this.providers.keys());
  }
}
