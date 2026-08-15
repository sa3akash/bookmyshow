"use client";

import React from "react";
import type { SeatCategory } from "@/types";
import type { RenderSeat } from "../utils/seat-layout";
import type { SeatCategoryStyle } from "./SeatCanvas";

interface PricingTabProps {
  prices: Record<SeatCategory, number>;
  editableSeats: RenderSeat[];
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
  onPriceChange: (category: SeatCategory, price: number) => void;
}

export function PricingTab({
  prices,
  editableSeats,
  categoryConfig,
  onPriceChange,
}: PricingTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
        Set default base pricing for each seat category. Updating a category updates all seats of that tier across the layout canvas.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(categoryConfig) as SeatCategory[]).map((category) => {
          const count = editableSeats.filter(
            (s) => s.category === category && s.type !== "WALKWAY",
          ).length;

          return (
            <div
              key={category}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {categoryConfig[category].icon}{" "}
                  {categoryConfig[category].name}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400">
                  {count} seats
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                  ৳
                </span>
                <input
                  type="number"
                  value={prices[category] ?? 0}
                  onChange={(e) =>
                    onPriceChange(category, Number(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-7 pr-3 text-sm font-bold text-emerald-400 outline-none focus:border-rose-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
