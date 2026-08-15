"use client";

import React from "react";
import Link from "next/link";
import { Ticket, ChevronRight } from "lucide-react";
import { Show, SeatItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BookingSummaryProps {
  show: Show | null;
  selectedSeats: SeatItem[];
  totalAmount: number;
  onProceed: () => void;
  isLoading?: boolean;
}

export function BookingSummary({
  show,
  selectedSeats,
  totalAmount,
  onProceed,
  isLoading = false,
}: BookingSummaryProps) {
  if (!show || selectedSeats.length === 0) return null;

  const seatLabels = selectedSeats.map((s) => s.label).join(", ");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#070a11]/95 p-4 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4">
        {/* Selected Seat Labels & Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono font-bold text-sm">
            {selectedSeats.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{show.movieTitle}</span>
              <span className="text-[10px] text-slate-400">({show.format})</span>
            </div>
            <p className="text-xs text-slate-400">
              Seats: <strong className="text-rose-400 font-mono">{seatLabels}</strong>
            </p>
          </div>
        </div>

        {/* Total Price & Proceed Button */}
        <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          <button
            type="button"
            onClick={onProceed}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{isLoading ? "Locking Seats..." : "Proceed to Checkout"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
