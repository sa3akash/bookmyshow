"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Lock, Info, RotateCw, Trash2, Paintbrush, Sliders, Shield } from "lucide-react";
import type { RenderSeat } from "../utils/seat-layout";
import { SeatCategory } from "@/types";

export interface SeatCategoryStyle {
  name: string;
  color: string;
  border: string;
  bg: string;
  icon: string;
}

interface SeatCanvasProps {
  seats: RenderSeat[];
  rows: { row: string; seats: RenderSeat[]; y: number }[];
  bounds: { minX: number; minY: number; width: number; height: number };
  categoryConfig: Record<SeatCategory, SeatCategoryStyle>;
  selectedIds: Set<string>;
  customerSelectedIds: Set<string>;
  filterCategory: SeatCategory | "ALL";
  mode: "EDITOR" | "PREVIEW";
  onSeatClick: (seat: RenderSeat) => void;
  onRowClick?: (row: string) => void;
  onSelectMultipleSeats?: (seatIds: string[], append?: boolean) => void;
  onUpdateSeat?: (seatId: string, updates: Partial<RenderSeat>) => void;
  onDeleteSeat?: (seatId: string) => void;
  venueName?: string;
  screenName?: string;
  scale?: number;
  showGrid?: boolean;
}

export const SeatCanvas = React.memo(function SeatCanvas({
  seats,
  rows,
  bounds,
  categoryConfig,
  selectedIds,
  customerSelectedIds,
  filterCategory,
  mode,
  onSeatClick,
  onRowClick,
  onSelectMultipleSeats,
  onUpdateSeat,
  onDeleteSeat,
  venueName,
  screenName,
  scale = 1,
  showGrid = true,
}: SeatCanvasProps) {
  const [hoveredSeat, setHoveredSeat] = useState<RenderSeat | null>(null);

  // Floating Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    seat: RenderSeat;
  } | null>(null);

  // Drag selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Increased padding & top gap for screen banner separation
  const offsetX = bounds.minX < 70 ? 70 - bounds.minX : 70;
  const offsetY = bounds.minY < 120 ? 120 - bounds.minY : 120;

  const canvasWidth = Math.max(900, (bounds.width + 140) * scale);
  const canvasHeight = Math.max(640, (bounds.height + 160) * scale);

  const screenWidth = useMemo(() => {
    const xs = seats.map((s) => s.x);
    const maxX = Math.max(...xs, 700);
    return Math.min(800, Math.max(460, maxX * 0.74));
  }, [seats]);

  // Derived column headers
  const columns = useMemo(() => {
    const colMap = new Map<number, number>();
    seats.forEach((s) => {
      if (s.type !== "WALKWAY") {
        const existingX = colMap.get(s.col);
        if (existingX === undefined || s.x < existingX) {
          colMap.set(s.col, s.x);
        }
      }
    });
    return [...colMap.entries()].sort(([a], [b]) => a - b);
  }, [seats]);

  // Close Context Menu on click outside
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleSeatContextMenu = (e: React.MouseEvent, seat: RenderSeat) => {
    if (mode !== "EDITOR") return;
    e.preventDefault();
    e.stopPropagation();

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setContextMenu({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        seat,
      });
    }
  };

  // Handle Rubberband Drag Selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "EDITOR" || !canvasRef.current) return;
    if ((e.target as HTMLElement).tagName !== "BUTTON" && !(e.target as HTMLElement).closest("button")) {
      setContextMenu(null);
      const rect = canvasRef.current.getBoundingClientRect();
      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      setIsSelecting(true);
      setSelectionBox({ startX, startY, currentX: startX, currentY: startY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    setSelectionBox((prev) => (prev ? { ...prev, currentX, currentY } : null));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionBox) return;
    setIsSelecting(false);

    const minX = Math.min(selectionBox.startX, selectionBox.currentX) - offsetX;
    const maxX = Math.max(selectionBox.startX, selectionBox.currentX) - offsetX;
    const minY = Math.min(selectionBox.startY, selectionBox.currentY) - offsetY;
    const maxY = Math.max(selectionBox.startY, selectionBox.currentY) - offsetY;

    const enclosedSeatIds = seats
      .filter((s) => s.type !== "WALKWAY" && s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY)
      .map((s) => s.id);

    if (enclosedSeatIds.length > 0 && onSelectMultipleSeats) {
      onSelectMultipleSeats(enclosedSeatIds, e.shiftKey || e.ctrlKey);
    }

    setSelectionBox(null);
  };

  return (
    <div className="w-full overflow-auto rounded-2xl border border-slate-800/90 bg-[#05070c] shadow-2xl relative select-none min-h-[620px] flex flex-col items-center justify-center p-6">
      {/* Ambient Top Screen Light Glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-500/10 via-purple-500/5 to-transparent pointer-events-none" />

      {/* Top Floating Seat Inspector & Info Bar */}
      <div className="absolute left-6 top-6 z-30 flex items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-950/90 px-3.5 py-2 backdrop-blur-md text-xs text-slate-300 shadow-xl">
        {hoveredSeat ? (
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {hoveredSeat.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              {categoryConfig[hoveredSeat.category]?.icon} {hoveredSeat.category}
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              ৳{hoveredSeat.basePrice}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              (X: {Math.round(hoveredSeat.x)}, Y: {Math.round(hoveredSeat.y)})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Info className="h-4 w-4 text-rose-500 shrink-0" />
            <span>Hover or click seats. Right-click any seat for quick context actions. Drag to marquee select.</span>
          </div>
        )}
      </div>

      {/* Main Centered Canvas Wrapper */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative mx-auto transition-all duration-200 cursor-crosshair"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: 900,
          minHeight: 640,
          backgroundImage: showGrid
            ? "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
            : "none",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Cinema Curved Screen Banner with Generous Top Gap */}
        <div
          className="absolute left-1/2 top-6 -translate-x-1/2 rounded-[50%] border-t-4 border-rose-500 bg-gradient-to-b from-rose-500/30 via-rose-500/10 to-transparent shadow-[0_-16px_50px_rgba(244,63,94,.45)] backdrop-blur-md"
          style={{
            width: screenWidth * scale,
            height: 56 * scale,
          }}
        >
          <div className="flex h-full items-center justify-center flex-col">
            <span className="text-[11px] font-black uppercase tracking-[.35em] text-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.7)]">
              CINEMA SCREEN
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              {venueName ?? "Cinema Auditorium"} • {screenName ?? "Main Screen"}
            </span>
          </div>
        </div>

        {/* Column Number Header Badges */}
        {columns.map(([colNum, colX]) => (
          <div
            key={colNum}
            className="absolute top-[92px] -translate-x-1/2 text-center font-mono text-[11px] font-bold text-slate-500"
            style={{
              left: (colX + offsetX + 15) * scale,
            }}
          >
            {colNum}
          </div>
        ))}

        {/* Left & Right Row Labels for every Row */}
        {rows.map((row) => {
          const rowSeats = row.seats.filter((s) => s.type !== "WALKWAY");
          if (rowSeats.length === 0) return null;

          const minX = Math.min(...rowSeats.map((s) => s.x));
          const maxX = Math.max(...rowSeats.map((s) => s.x + s.width));
          const centerY = (row.y + offsetY) * scale;

          return (
            <React.Fragment key={row.row}>
              {/* Horizontal Row Baseline Guide Line */}
              {showGrid && (
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-slate-800/40 pointer-events-none"
                  style={{ top: centerY + 15 * scale }}
                />
              )}

              {/* LEFT Row Label Badge */}
              <button
                type="button"
                onClick={() => onRowClick?.(row.row)}
                className="absolute flex h-7 min-w-[28px] px-2 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/95 font-mono text-xs font-black text-slate-300 hover:border-rose-500 hover:bg-rose-950/60 hover:text-rose-400 shadow-md transition-all z-20 hover:scale-110"
                style={{
                  left: Math.max(16, (minX + offsetX - 44) * scale),
                  top: centerY,
                }}
                title={`Row ${row.row} (Left Badge - Click to edit)`}
              >
                {row.row}
              </button>

              {/* RIGHT Row Label Badge */}
              <button
                type="button"
                onClick={() => onRowClick?.(row.row)}
                className="absolute flex h-7 min-w-[28px] px-2 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/95 font-mono text-xs font-black text-slate-300 hover:border-rose-500 hover:bg-rose-950/60 hover:text-rose-400 shadow-md transition-all z-20 hover:scale-110"
                style={{
                  left: (maxX + offsetX + 14) * scale,
                  top: centerY,
                }}
                title={`Row ${row.row} (Right Badge - Click to edit)`}
              >
                {row.row}
              </button>
            </React.Fragment>
          );
        })}

        {/* Rubberband Drag Selection Rect */}
        {isSelecting && selectionBox && (
          <div
            className="absolute z-40 border-2 border-dashed border-rose-500 bg-rose-500/15 backdrop-blur-[1px] pointer-events-none rounded-lg"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.currentX) * scale,
              top: Math.min(selectionBox.startY, selectionBox.currentY) * scale,
              width: Math.abs(selectionBox.currentX - selectionBox.startX) * scale,
              height: Math.abs(selectionBox.currentY - selectionBox.startY) * scale,
            }}
          />
        )}

        {/* Floating Seat Context Menu */}
        {contextMenu && (
          <div
            className="absolute z-50 w-48 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md text-xs text-slate-200 space-y-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1 font-mono font-bold text-rose-400 border-b border-slate-800 flex justify-between items-center">
              <span>Seat {contextMenu.seat.label}</span>
              <span className="text-[10px] text-slate-500">
                {contextMenu.seat.category}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdateSeat?.(contextMenu.seat.id, {
                  rotation: (contextMenu.seat.rotation + 90) % 360,
                });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-slate-800 text-slate-300"
            >
              <RotateCw className="h-3.5 w-3.5 text-purple-400" /> Rotate (90°)
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateSeat?.(contextMenu.seat.id, {
                  status: contextMenu.seat.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED",
                });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-slate-800 text-slate-300"
            >
              <Shield className="h-3.5 w-3.5 text-rose-400" /> Toggle Blocked
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateSeat?.(contextMenu.seat.id, {
                  type: contextMenu.seat.type === "WALKWAY" ? "STANDARD" : "WALKWAY",
                  label: contextMenu.seat.type === "WALKWAY" ? `${contextMenu.seat.row}${contextMenu.seat.col}` : "",
                });
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-slate-800 text-slate-300"
            >
              <Sliders className="h-3.5 w-3.5 text-amber-400" /> Toggle Walkway
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteSeat?.(contextMenu.seat.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 hover:bg-rose-950/80 text-rose-400 border-t border-slate-800/80 mt-1 pt-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Seat
            </button>
          </div>
        )}

        {/* Seat Items */}
        {seats.map((seat) => {
          const isBlocked = seat.status === "BLOCKED";
          const isWalkway = seat.type === "WALKWAY";
          const selected = selectedIds.has(seat.id);
          const customerSelected = customerSelectedIds.has(seat.id);
          const matches = filterCategory === "ALL" || seat.category === filterCategory;
          const cfg = categoryConfig[seat.category];

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
              <button
                key={seat.id}
                type="button"
                onClick={() => onSeatClick(seat)}
                onContextMenu={(e) => handleSeatContextMenu(e, seat)}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                className={`absolute rounded border border-dashed border-slate-700/50 bg-slate-900/20 hover:border-amber-500/60 ${
                  mode === "EDITOR" && selected ? "ring-2 ring-rose-500 bg-rose-950/30" : ""
                }`}
                style={style}
                title={`Walkway Aisle ${seat.row}${seat.col}`}
              />
            );
          }

          return (
            <button
              key={seat.id}
              type="button"
              disabled={mode === "PREVIEW" && isBlocked}
              onClick={() => onSeatClick(seat)}
              onContextMenu={(e) => handleSeatContextMenu(e, seat)}
              onMouseEnter={() => setHoveredSeat(seat)}
              onMouseLeave={() => setHoveredSeat(null)}
              className={[
                "absolute z-10 flex flex-col items-center justify-center rounded-t-xl border border-b-2",
                "font-mono text-[9px] font-bold transition-all duration-150 shadow-md",
                "hover:z-30 hover:scale-125 hover:shadow-2xl active:scale-95",
                !matches
                  ? "opacity-15"
                  : isBlocked
                    ? mode === "EDITOR" && selected
                      ? "border-white bg-rose-700 text-white ring-2 ring-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.8)]"
                      : "border-rose-900/80 bg-rose-950/80 text-rose-400 border-b-rose-700"
                    : mode === "PREVIEW" && customerSelected
                      ? "border-emerald-300 bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-[0_0_22px_rgba(16,185,129,0.8)]"
                      : mode === "EDITOR" && selected
                        ? "border-white bg-rose-500 text-white ring-2 ring-rose-400 shadow-[0_0_22px_rgba(244,63,94,0.8)]"
                        : `${cfg?.border ?? "border-slate-500"} ${cfg?.bg ?? "bg-slate-900 text-slate-300"}`,
              ].join(" ")}
              style={style}
            >
              {isBlocked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <span>{seat.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
