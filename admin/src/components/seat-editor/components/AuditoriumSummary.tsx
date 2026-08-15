"use client";

import React from "react";
import { formatCurrency } from "../../../lib/utils";
import type { RenderSeat } from "../utils/seat-layout";

interface AuditoriumSummaryProps {
  totalItemsCount: number;
  activeRowsCount: number;
  activeSeatsCount: number;
  blockedSeatsCount: number;
  revenue: number;
}

export function AuditoriumSummary({
  totalItemsCount,
  activeRowsCount,
  activeSeatsCount,
  blockedSeatsCount,
  revenue,
}: AuditoriumSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 text-sm font-bold text-white">
        Auditorium Summary
      </div>

      <div className="space-y-2 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Total Items</span>
          <strong className="text-white font-mono">{totalItemsCount}</strong>
        </div>
        <div className="flex justify-between">
          <span>Active Rows</span>
          <strong className="text-white font-mono">{activeRowsCount}</strong>
        </div>
        <div className="flex justify-between">
          <span>Bookable Seats</span>
          <strong className="text-emerald-400 font-mono">
            {activeSeatsCount}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Blocked Seats</span>
          <strong className="text-rose-400 font-mono">
            {blockedSeatsCount}
          </strong>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-2">
          <span>Full Capacity Revenue</span>
          <strong className="text-emerald-400 font-mono">
            {formatCurrency(revenue)}
          </strong>
        </div>
      </div>
    </div>
  );
}
