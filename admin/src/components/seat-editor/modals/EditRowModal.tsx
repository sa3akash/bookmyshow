"use client";

import React from "react";
import { Edit3 } from "lucide-react";
import type { SeatCategory } from "@/types";
import type { SeatCategoryStyle } from "../components/SeatCanvas";

interface EditRowModalProps {
  isOpen: boolean;
  rowLabel: string | null;
  nameInput: string;
  categoryInput: SeatCategory;
  prices: Record<SeatCategory, number>;
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
  onClose: () => void;
  onNameInputChange: (val: string) => void;
  onCategoryInputChange: (val: SeatCategory) => void;
  onShiftRow: (row: string, deltaX: number, deltaY: number) => void;
  onSave: () => void;
}

export function EditRowModal({
  isOpen,
  rowLabel,
  nameInput,
  categoryInput,
  prices,
  categoryConfig,
  onClose,
  onNameInputChange,
  onCategoryInputChange,
  onShiftRow,
  onSave,
}: EditRowModalProps) {
  if (!isOpen || !rowLabel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-rose-500" /> Edit Row Properties ({rowLabel})
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
              Rename Row Label
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => onNameInputChange(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Apply Tier Category to Entire Row
            </label>
            <select
              value={categoryInput}
              onChange={(e) => onCategoryInputChange(e.target.value as SeatCategory)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            >
              {(Object.keys(categoryConfig) as SeatCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryConfig[cat].icon} {categoryConfig[cat].name} (৳{prices[cat]})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="mb-2 block text-xs text-slate-400 font-medium">
              Shift Position Offsets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onShiftRow(rowLabel, -20, 0)}
                className="rounded-lg border border-slate-700 bg-slate-950 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                ← Shift Left (20px)
              </button>
              <button
                type="button"
                onClick={() => onShiftRow(rowLabel, 20, 0)}
                className="rounded-lg border border-slate-700 bg-slate-950 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Shift Right (20px) →
              </button>
              <button
                type="button"
                onClick={() => onShiftRow(rowLabel, 0, -20)}
                className="rounded-lg border border-slate-700 bg-slate-950 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                ↑ Shift Up (20px)
              </button>
              <button
                type="button"
                onClick={() => onShiftRow(rowLabel, 0, 20)}
                className="rounded-lg border border-slate-700 bg-slate-950 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Shift Down (20px) ↓
              </button>
            </div>
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
            onClick={onSave}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            Save Row Properties
          </button>
        </div>
      </div>
    </div>
  );
}
