"use client";

import React from "react";
import { Paintbrush, Lock } from "lucide-react";
import type { SeatCategory } from "@/types";
import type { SeatCategoryStyle } from "./SeatCanvas";

export type Tool = SeatCategory | "SELECT" | "BLOCK" | "WALKWAY";

interface PainterControlsProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
}

export function PainterControls({
  tool,
  onToolChange,
  categoryConfig,
}: PainterControlsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-white">
        <span className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-rose-500" />
          Seat Painter Tool
        </span>
        <span className="font-mono text-xs text-rose-400 font-bold uppercase">
          {tool}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(categoryConfig) as SeatCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onToolChange(cat)}
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
              tool === cat
                ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500 shadow-md"
                : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
          >
            <span className="text-base">{categoryConfig[cat].icon}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-white">{cat}</div>
              <div className="truncate text-[10px] text-slate-400">
                {categoryConfig[cat].name}
              </div>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={() => onToolChange("BLOCK")}
          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
            tool === "BLOCK"
              ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500 shadow-md"
              : "border-slate-800 bg-slate-950 hover:border-slate-700"
          }`}
        >
          <Lock className="h-4 w-4 text-rose-400" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-white">Blocked</div>
            <div className="truncate text-[10px] text-slate-400">
              Unavailable Seat
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onToolChange("WALKWAY")}
          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
            tool === "WALKWAY"
              ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500 shadow-md"
              : "border-slate-800 bg-slate-950 hover:border-slate-700"
          }`}
        >
          <span className="text-base">🚶</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-white">Aisle Gap</div>
            <div className="truncate text-[10px] text-slate-400">
              Walkway Space
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
