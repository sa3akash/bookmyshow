"use client";

import React from "react";
import { Wand2 } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (
    type: "IMAX_CURVED" | "VIP_RECLINER" | "STANDARD_MULTIPLEX" | "BALCONY_AUDITORIUM",
  ) => void;
}

export function TemplateModal({
  isOpen,
  onClose,
  onApplyTemplate,
}: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-400" /> Auditorium Layout Presets
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Select a pre-built architectural layout template. Warning: Applying a template will replace the current local canvas layout.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onApplyTemplate("IMAX_CURVED")}
            className="flex flex-col text-left p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 transition-all hover:border-purple-500/60"
          >
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              🌟 IMAX Curved Arc Screen
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              120 Seats • Curved arcs for immersive viewing, Royal Recliners, Platinum & Executive Gold tiers.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onApplyTemplate("VIP_RECLINER")}
            className="flex flex-col text-left p-4 rounded-xl border border-pink-500/30 bg-pink-950/20 hover:bg-pink-950/40 transition-all hover:border-pink-500/60"
          >
            <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
              👑 VIP Recliner Suite
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              40 Seats • Luxurious Recliners, VIP Loungers, Couple Seating & extra wide aisles.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onApplyTemplate("BALCONY_AUDITORIUM")}
            className="flex flex-col text-left p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40 transition-all hover:border-blue-500/60"
          >
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              🏛️ Balcony & Stalls Auditorium
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              150 Seats • Upper Balcony Tier + Lower Stalls with side walkways.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onApplyTemplate("STANDARD_MULTIPLEX")}
            className="flex flex-col text-left p-4 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 transition-all"
          >
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              💺 Standard Multiplex Grid
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              120 Seats • 10 Rows x 12 Cols with dual central aisles.
            </span>
          </button>
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
