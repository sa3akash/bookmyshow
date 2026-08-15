"use client";

import React from "react";
import { Tag, Sparkles, ShieldCheck, Copy, Check } from "lucide-react";
import { MOCK_COUPONS } from "@/lib/api/client";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-rose-500" />
          <h1 className="text-2xl font-black tracking-tight text-white">Movie Offers & Promo Coupons</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Apply discount promo codes during checkout for instant BDT cashback & ticket savings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_COUPONS.map((coupon) => (
          <div
            key={coupon.code}
            className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-4 hover:border-rose-500/50 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20">
                  {coupon.code}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                  VERIFIED
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">{coupon.description}</h3>
              <p className="text-xs text-slate-400">
                Valid on all Star Cineplex and Blockbuster movie showtimes. Minimum booking amount applies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(coupon.code)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-200 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Code Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Promo Code
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
