"use client";

import React from "react";
import { Columns } from "lucide-react";

interface AisleModalProps {
  isOpen: boolean;
  columnNum: number;
  onClose: () => void;
  onColumnNumChange: (val: number) => void;
  onSubmit: () => void;
}

export function AisleModal({
  isOpen,
  columnNum,
  onClose,
  onColumnNumChange,
  onSubmit,
}: AisleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Columns className="h-4 w-4 text-amber-400" /> Insert Vertical Walkway Aisle
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
              Insert Aisle Gap After Column Number:
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={columnNum}
              onChange={(e) => onColumnNumChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              This will shift all columns &ge; {columnNum} rightwards by 36px, creating a clear central or side walkway aisle.
            </p>
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
            className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
          >
            Insert Aisle Gap
          </button>
        </div>
      </div>
    </div>
  );
}
