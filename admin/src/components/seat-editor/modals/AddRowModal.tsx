"use client";

import React from "react";
import { Plus } from "lucide-react";
import type { SeatCategory } from "@/types";
import type { SeatCategoryStyle } from "../components/SeatCanvas";

interface AddRowModalProps {
  isOpen: boolean;
  rowLabel: string;
  seatsCount: number;
  category: SeatCategory;
  prices: Record<SeatCategory, number>;
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
  onClose: () => void;
  onRowLabelChange: (val: string) => void;
  onSeatsCountChange: (val: number) => void;
  onCategoryChange: (val: SeatCategory) => void;
  onSubmit: () => void;
}

export function AddRowModal({
  isOpen,
  rowLabel,
  seatsCount,
  category,
  prices,
  categoryConfig,
  onClose,
  onRowLabelChange,
  onSeatsCountChange,
  onCategoryChange,
  onSubmit,
}: AddRowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-rose-500" /> Add New Row
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Row Label (e.g. A, B, C, VIP1)
            </label>
            <input
              type="text"
              value={rowLabel}
              onChange={(e) => onRowLabelChange(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Number of Seats
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={seatsCount}
              onChange={(e) => onSeatsCountChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Default Seat Tier / Category
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as SeatCategory)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            >
              {(Object.keys(categoryConfig) as SeatCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryConfig[cat].icon} {categoryConfig[cat].name} (৳{prices[cat]})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            Create Row
          </button>
        </div>
      </div>
    </div>
  );
}
