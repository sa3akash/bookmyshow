"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, ShieldCheck, Check, CreditCard, Ticket, RefreshCw } from "lucide-react";
import { useBookingStore } from "@/stores/booking.store";
import { useValidateCouponMutation } from "@/hooks/useClientQueries";
import { MOCK_COUPONS } from "@/lib/api/client";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { SeatHoldTimer } from "@/components/seat/SeatHoldTimer";
import { formatCurrency, formatDateString } from "@/lib/utils";

interface CheckoutPageProps {
  params: Promise<{ showId: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { showId } = use(params);
  const router = useRouter();

  const {
    show,
    selectedSeats,
    expiresAt,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getConvenienceFee,
    getTaxAmount,
    getDiscountAmount,
    getTotalAmount,
  } = useBookingStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateCouponMutation = useValidateCouponMutation();

  if (!show || selectedSeats.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Seats Selected</h2>
        <p className="text-xs text-slate-400">Please choose your seats before proceeding to checkout.</p>
        <button
          type="button"
          onClick={() => router.push(`/booking/${showId}/seats`)}
          className="rounded-2xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white"
        >
          Return to Seat Map
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!inputCoupon.trim()) return;

    try {
      const validated = await validateCouponMutation.mutateAsync({
        code: inputCoupon.trim(),
        totalAmount: getSubtotal(),
      });
      applyCoupon(validated);
      setInputCoupon("");
    } catch (err) {
      setCouponError("Invalid coupon code. Try BMS100 or BMSFIFTY.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Order Review & Checkout</h1>
            <p className="text-xs text-slate-400">Review your ticket summary before payment</p>
          </div>
        </div>

        {expiresAt && <SeatHoldTimer expiresAt={expiresAt} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Movie & Ticket Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Movie Card Header */}
          <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-[#090c14] p-5 shadow-xl">
            <img
              src={show.moviePoster}
              alt={show.movieTitle}
              className="h-24 w-16 rounded-xl object-cover border border-slate-700"
            />
            <div className="space-y-1">
              <h2 className="font-extrabold text-base text-white">{show.movieTitle}</h2>
              <p className="text-xs text-slate-400">
                {show.venueName} • {show.screenName}
              </p>
              <p className="text-xs text-rose-400 font-semibold">
                {formatDateString(show.showDate)} • {show.startTime} ({show.format})
              </p>
              <p className="text-xs text-slate-300 font-mono">
                Seats: <strong className="text-white">{selectedSeats.map((s) => s.label).join(", ")}</strong>
              </p>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Tag className="h-4 w-4 text-rose-500" /> Apply Promo Code / Coupon
              {validateCouponMutation.isPending && <RefreshCw className="h-3.5 w-3.5 text-rose-500 animate-spin" />}
            </div>

            {coupon ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Coupon <strong>{coupon.code}</strong> Applied!</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter Coupon Code (e.g. BMS100)"
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={validateCouponMutation.isPending}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Price Breakdown & Pay CTA */}
        <div className="space-y-6">
          <PriceBreakdown
            subtotal={getSubtotal()}
            convenienceFee={getConvenienceFee()}
            taxAmount={getTaxAmount()}
            discountAmount={getDiscountAmount()}
            totalAmount={getTotalAmount()}
            seatCount={selectedSeats.length}
            couponCode={coupon?.code}
          />

          <button
            type="button"
            onClick={() => router.push(`/booking/${showId}/payment`)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
          >
            <CreditCard className="h-4 w-4" /> Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
