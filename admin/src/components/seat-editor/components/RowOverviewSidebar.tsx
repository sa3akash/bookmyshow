"use client";

import React from "react";
import { Sliders, Plus, Edit3, Trash2 } from "lucide-react";
import type { SeatCategory } from "@/types";
import type { RenderSeat } from "../utils/seat-layout";
import type { SeatCategoryStyle } from "./SeatCanvas";

interface RowOverviewSidebarProps {
  rows: { row: string; seats: RenderSeat[]; y: number }[];
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
  onAddRowClick: () => void;
  onOpenEditRow: (row: string) => void;
  onAddSeatToRow: (row: string) => void;
  onDeleteRow: (row: string) => void;
  onShiftRow: (row: string, deltaX: number, deltaY: number) => void;
}

export function RowOverviewSidebar({
  rows,
  categoryConfig,
  onAddRowClick,
  onOpenEditRow,
  onAddSeatToRow,
  onDeleteRow,
  onShiftRow,
}: RowOverviewSidebarProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-white">
        <span className="flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-rose-500" /> Row Overview
        </span>
        <button
          type="button"
          onClick={onAddRowClick}
          className="flex items-center gap-1 rounded bg-rose-600/20 px-2 py-0.5 text-[11px] text-rose-400 hover:bg-rose-600/30"
        >
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <div className="text-xs text-slate-500 italic">No rows created yet.</div>
        ) : (
          rows.map((r) => {
            const nonWalkwayCount = r.seats.filter((s) => s.type !== "WALKWAY").length;
            const primaryCat = r.seats[0]?.category ?? "SILVER";

            return (
              <div
                key={r.row}
                className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">
                      Row {r.row}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({nonWalkwayCount} seats)
                    </span>
                    <span className="text-[10px]">
                      {categoryConfig[primaryCat]?.icon}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditRow(r.row)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                      title={`Edit properties for Row ${r.row}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddSeatToRow(r.row)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                      title={`Add seat to Row ${r.row}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRow(r.row)}
                      className="p-1 rounded text-slate-400 hover:bg-rose-950/60 hover:text-rose-400"
                      title={`Delete Row ${r.row}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Shift Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-500">Position Offset</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onShiftRow(r.row, -15, 0)}
                      className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 font-mono hover:bg-slate-800"
                      title="Shift Left 15px"
                    >
                      ← Left
                    </button>
                    <button
                      type="button"
                      onClick={() => onShiftRow(r.row, 15, 0)}
                      className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 font-mono hover:bg-slate-800"
                      title="Shift Right 15px"
                    >
                      Right →
                    </button>
                    <button
                      type="button"
                      onClick={() => onShiftRow(r.row, 0, -15)}
                      className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 font-mono hover:bg-slate-800"
                      title="Shift Up 15px"
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      onClick={() => onShiftRow(r.row, 0, 15)}
                      className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 font-mono hover:bg-slate-800"
                      title="Shift Down 15px"
                    >
                      Down ↓
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
