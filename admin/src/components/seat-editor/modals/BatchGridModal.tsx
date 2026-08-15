"use client";

import React from "react";
import { Grid3X3 } from "lucide-react";

interface BatchGridModalProps {
  isOpen: boolean;
  startRow: string;
  rowCount: number;
  seatsPerRow: number;
  aislesText: string;
  onClose: () => void;
  onStartRowChange: (val: string) => void;
  onRowCountChange: (val: number) => void;
  onSeatsPerRowChange: (val: number) => void;
  onAislesTextChange: (val: string) => void;
  onSubmit: () => void;
}

export function BatchGridModal({
  isOpen,
  startRow,
  rowCount,
  seatsPerRow,
  aislesText,
  onClose,
  onStartRowChange,
  onRowCountChange,
  onSeatsPerRowChange,
  onAislesTextChange,
  onSubmit,
}: BatchGridModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-blue-400" /> Batch Auditorium Grid Builder
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400 font-medium">
                Starting Row Letter
              </label>
              <input
                type="text"
                maxLength={2}
                value={startRow}
                onChange={(e) => onStartRowChange(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400 font-medium">
                Number of Rows
              </label>
              <input
                type="number"
                min={1}
                max={26}
                value={rowCount}
                onChange={(e) => onRowCountChange(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Seats per Row
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={seatsPerRow}
              onChange={(e) => onSeatsPerRowChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400 font-medium">
              Aisle Columns (Comma-separated col numbers, e.g. 4,10)
            </label>
            <input
              type="text"
              value={aislesText}
              onChange={(e) => onAislesTextChange(e.target.value)}
              placeholder="e.g. 4, 10"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
            />
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
          >
            Generate Grid ({rowCount * seatsPerRow} Seats)
          </button>
        </div>
      </div>
    </div>
  );
}
