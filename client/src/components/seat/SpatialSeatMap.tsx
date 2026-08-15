"use client";

import React, { useState, useMemo } from "react";
import { Lock, ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react";
import { SeatItem } from "@/types";
import { normalizeSeatLayout } from "@/lib/seat-normalization";
import { formatCurrency } from "@/lib/utils";

interface SpatialSeatMapProps {
  seats: SeatItem[];
  selectedSeatIds: Set<string>;
  onSeatToggle: (seat: SeatItem) => void;
  maxSeatsLimit?: number;
}

const CATEGORY_COLORS: Record<
  SeatItem["category"],
  { border: string; bg: string; text: string; icon?: string }
> = {
  SILVER: { border: "border-slate-500", bg: "bg-slate-900", text: "text-slate-300" },
  GOLD: { border: "border-amber-500", bg: "bg-amber-950/80", text: "text-amber-300" },
  PLATINUM: { border: "border-purple-500", bg: "bg-purple-950/80", text: "text-purple-300" },
  VIP: { border: "border-pink-500", bg: "bg-pink-950/80", text: "text-pink-300" },
  RECLINER: { border: "border-rose-500", bg: "bg-rose-950/80", text: "text-rose-300" },
  COUPLE: { border: "border-rose-400", bg: "bg-rose-900/60", text: "text-rose-200" },
  ACCESSIBLE: { border: "border-blue-500", bg: "bg-blue-950/80", text: "text-blue-300" },
};

export function SpatialSeatMap({
  seats,
  selectedSeatIds,
  onSeatToggle,
  maxSeatsLimit = 8,
}: SpatialSeatMapProps) {
  const [scale, setScale] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState<SeatItem | null>(null);

  const normalized = useMemo(() => normalizeSeatLayout(seats), [seats]);

  const canvasWidth = Math.max(840, normalized.bounds.width * scale);
  const canvasHeight = Math.max(540, normalized.bounds.height * scale);

  const offsetX = normalized.bounds.minX < 60 ? 60 - normalized.bounds.minX : 60;
  const offsetY = normalized.bounds.minY < 100 ? 100 - normalized.bounds.minY : 100;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/90 bg-[#05070c] shadow-2xl p-4 flex flex-col items-center">
      {/* Zoom Controls & Hover Tooltip Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 z-20">
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
          {hoveredSeat ? (
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-rose-400">Seat {hoveredSeat.label}</span>
              <span>•</span>
              <span className="text-slate-400">{hoveredSeat.category}</span>
              <span>•</span>
              <span className="font-bold text-emerald-400">{formatCurrency(hoveredSeat.price)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="h-3.5 w-3.5 text-rose-500" />
              <span>Tap or click available seats to select. Limit max {maxSeatsLimit} seats per transaction.</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[40px] text-center font-mono text-xs font-bold text-rose-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Seat Canvas Scroll Area */}
      <div className="w-full overflow-auto rounded-2xl bg-[#06080d] p-4 custom-scrollbar flex items-center justify-center">
        <div
          className="relative transition-transform duration-200"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            minWidth: 840,
            minHeight: 540,
            backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Cinema Curved Screen Banner */}
          <div
            className="absolute left-1/2 top-4 -translate-x-1/2 rounded-[50%] border-t-4 border-rose-500 bg-gradient-to-b from-rose-500/30 via-rose-500/10 to-transparent shadow-[0_-16px_50px_rgba(244,63,94,.45)] backdrop-blur-md"
            style={{
              width: 580 * scale,
              height: 52 * scale,
            }}
          >
            <div className="flex h-full items-center justify-center flex-col">
              <span className="text-[11px] font-black uppercase tracking-[.35em] text-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.7)]">
                SCREEN THIS WAY
              </span>
            </div>
          </div>

          {/* Left & Right Row Labels */}
          {normalized.rows.map((row) => {
            if (row.seats.length === 0) return null;
            const minSeatX = Math.min(...row.seats.map((s) => s.x));
            const maxSeatX = Math.max(...row.seats.map((s) => s.x + s.width));
            const centerY = (row.y + offsetY) * scale;

            return (
              <React.Fragment key={row.rowLabel}>
                {/* Left Badge */}
                <div
                  className="absolute flex h-7 min-w-[28px] px-2 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 font-mono text-xs font-black text-slate-300 shadow-md"
                  style={{
                    left: Math.max(16, (minSeatX + offsetX - 42) * scale),
                    top: centerY,
                  }}
                >
                  {row.rowLabel}
                </div>

                {/* Right Badge */}
                <div
                  className="absolute flex h-7 min-w-[28px] px-2 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 font-mono text-xs font-black text-slate-300 shadow-md"
                  style={{
                    left: (maxSeatX + offsetX + 12) * scale,
                    top: centerY,
                  }}
                >
                  {row.rowLabel}
                </div>
              </React.Fragment>
            );
          })}

          {/* Individual Seat Render Buttons */}
          {normalized.seats.map((seat) => {
            const isBooked = seat.status === "BOOKED" || seat.status === "UNAVAILABLE";
            const isBlocked = seat.status === "BLOCKED";
            const isWalkway = seat.type === "WALKWAY";
            const isSelected = selectedSeatIds.has(seat.id);
            const cfg = CATEGORY_COLORS[seat.category] || CATEGORY_COLORS.SILVER;

            const style: React.CSSProperties = {
              left: (seat.x + offsetX) * scale,
              top: (seat.y + offsetY) * scale,
              width: seat.width * scale,
              height: seat.height * scale,
              transform: `rotate(${seat.rotation}deg)`,
              transformOrigin: "center",
            };

            if (isWalkway) {
              return (
                <div
                  key={seat.id}
                  className="absolute rounded border border-dashed border-slate-800/40 bg-transparent pointer-events-none"
                  style={style}
                />
              );
            }

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isBooked || isBlocked}
                onClick={() => onSeatToggle(seat)}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                className={[
                  "absolute z-10 flex flex-col items-center justify-center rounded-t-xl border border-b-2",
                  "font-mono text-[9px] font-bold transition-all duration-150 shadow-md",
                  "hover:z-30 hover:scale-125 active:scale-95",
                  isBooked
                    ? "border-slate-800 bg-slate-950 text-slate-600 border-b-slate-900 cursor-not-allowed"
                    : isBlocked
                    ? "border-rose-950 bg-rose-950/60 text-rose-800 border-b-rose-950 cursor-not-allowed"
                    : isSelected
                    ? "border-white bg-rose-600 text-white ring-2 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                    : `${cfg.border} ${cfg.bg} ${cfg.text} hover:border-rose-400`,
                ].join(" ")}
                style={style}
              >
                {isBooked || isBlocked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <span>{seat.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
