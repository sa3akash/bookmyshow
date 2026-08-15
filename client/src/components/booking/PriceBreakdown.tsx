import React from "react";
import { Receipt, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PriceBreakdownProps {
  subtotal: number;
  convenienceFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  seatCount: number;
  couponCode?: string;
}

export function PriceBreakdown({
  subtotal,
  convenienceFee,
  taxAmount,
  discountAmount,
  totalAmount,
  seatCount,
  couponCode,
}: PriceBreakdownProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
        <Receipt className="h-4 w-4 text-rose-500" />
        <span>Price Breakdown</span>
      </div>

      <div className="space-y-2.5 text-xs text-slate-300 font-medium">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Tickets ({seatCount} Seats)</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Convenience Fee</span>
          <span className="font-mono">{formatCurrency(convenienceFee)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Govt. Tax & VAT (5%)</span>
          <span className="font-mono">{formatCurrency(taxAmount)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Coupon ({couponCode})
            </span>
            <span className="font-mono">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm font-black">
        <span className="text-white">Total Amount</span>
        <span className="text-emerald-400 font-mono text-base">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
