"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { useBookingStore } from "@/stores/booking.store";
import { useProcessPaymentMutation } from "@/hooks/useClientQueries";
import { PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface PaymentPageProps {
  params: Promise<{ showId: string }>;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bkash", name: "bKash Mobile Wallet", icon: "📱", category: "MOBILE_BANKING", description: "Pay securely via bKash PIN & OTP" },
  { id: "nagad", name: "Nagad Mobile Money", icon: "💸", category: "MOBILE_BANKING", description: "Instant payment with Nagad account" },
  { id: "visa_master", name: "Credit / Debit Card (Visa/Mastercard)", icon: "💳", category: "CARD", description: "Local & International Cards" },
  { id: "city_touch", name: "City Touch Internet Banking", icon: "🏦", category: "NET_BANKING", description: "Direct Bank Transfer" },
];

export default function PaymentPage({ params }: PaymentPageProps) {
  const { showId } = use(params);
  const router = useRouter();

  const { show, selectedSeats, holdId, getTotalAmount } = useBookingStore();
  const [selectedMethod, setSelectedMethod] = useState<string>("bkash");
  const processPaymentMutation = useProcessPaymentMutation();

  if (!show || selectedSeats.length === 0) {
    router.push("/");
    return null;
  }

  const handlePayNow = async () => {
    const bookingIdToUse = holdId || `BMS_${Math.floor(100000 + Math.random() * 900000)}`;

    await processPaymentMutation.mutateAsync({
      bookingId: bookingIdToUse,
      provider: selectedMethod.toUpperCase(),
    });

    router.push(`/booking/${showId}/confirmation/${bookingIdToUse}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Payment Gateway</span>
            {processPaymentMutation.isPending && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
          </h1>
          <p className="text-xs text-slate-400">Select payment method to complete ticket purchase</p>
        </div>
      </div>

      {/* Amount Header Banner */}
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 p-6 text-center space-y-1 shadow-xl">
        <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">
          AMOUNT TO PAY
        </span>
        <div className="text-3xl font-black text-emerald-400 font-mono">
          {formatCurrency(getTotalAmount())}
        </div>
        <p className="text-xs text-slate-400">
          {show.movieTitle} • {selectedSeats.length} Tickets ({selectedSeats.map((s) => s.label).join(", ")})
        </p>
      </div>

      {/* Payment Options Selection */}
      <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Select Payment Provider</h3>

        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/10 text-white font-bold ring-1 ring-rose-500 shadow-md"
                    : "border-slate-800/80 bg-slate-950 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{method.name}</h4>
                    <p className="text-[10px] text-slate-400">{method.description}</p>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pay CTA */}
      <button
        type="button"
        onClick={handlePayNow}
        disabled={processPaymentMutation.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        <span>{processPaymentMutation.isPending ? "Authorizing Payment..." : `Pay ${formatCurrency(getTotalAmount())}`}</span>
      </button>

      {/* Security Note */}
      <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Encrypted with 256-bit SSL security. Your credentials are never stored.
      </p>
    </div>
  );
}
