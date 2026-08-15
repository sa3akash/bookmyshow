"use client";

import * as React from "react";
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Lock, Unlock, Armchair, DollarSign, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";

export type SeatCategory = "REGULAR" | "VIP" | "RECLINER" | "COUPLE" | "ACCESSIBLE";
export type SeatStatus = "AVAILABLE" | "BLOCKED" | "HELD" | "BOOKED";

export interface SeatItem {
  id: string;
  row: string;
  number: number;
  category: SeatCategory;
  priceBDT: number;
  status: SeatStatus;
  x: number;
  y: number;
}

const CATEGORY_COLORS: Record<SeatCategory, { bg: string; text: string; border: string }> = {
  REGULAR: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/40" },
  VIP: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40" },
  RECLINER: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/40" },
  COUPLE: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/40" },
  ACCESSIBLE: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/40" },
};

export function SeatLayoutEditor() {
  const [rows, setRows] = React.useState<string[]>(["A", "B", "C", "D", "E", "F", "G"]);
  const [seatsPerRow, setSeatsPerRow] = React.useState(12);
  const [seats, setSeats] = React.useState<SeatItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<SeatCategory>("REGULAR");
  const [zoom, setZoom] = React.useState(1);

  // Initialize seat grid
  React.useEffect(() => {
    const initialSeats: SeatItem[] = [];
    rows.forEach((row, rowIndex) => {
      for (let num = 1; num <= seatsPerRow; num++) {
        let cat: SeatCategory = "REGULAR";
        let price = 450;

        if (row === "A" || row === "B") {
          cat = "RECLINER";
          price = 950;
        } else if (row === "C" || row === "D") {
          cat = "VIP";
          price = 750;
        } else if (row === "G" && (num === 1 || num === 12)) {
          cat = "ACCESSIBLE";
          price = 450;
        }

        initialSeats.push({
          id: `${row}-${num}`,
          row,
          number: num,
          category: cat,
          priceBDT: price,
          status: "AVAILABLE",
          x: num * 44,
          y: rowIndex * 48,
        });
      }
    });
    setSeats(initialSeats);
  }, [rows, seatsPerRow]);

  const toggleSelectSeat = (id: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyCategoryToSelected = (category: SeatCategory, price: number) => {
    setSeats((prev) =>
      prev.map((s) => (selectedSeatIds.includes(s.id) ? { ...s, category, priceBDT: price } : s))
    );
    setSelectedSeatIds([]);
  };

  const applyStatusToSelected = (status: SeatStatus) => {
    setSeats((prev) =>
      prev.map((s) => (selectedSeatIds.includes(s.id) ? { ...s, status } : s))
    );
    setSelectedSeatIds([]);
  };

  const addRow = () => {
    const nextChar = String.fromCharCode(65 + rows.length);
    setRows([...rows, nextChar]);
  };

  const totalCapacity = seats.length;
  const totalBlocked = seats.filter((s) => s.status === "BLOCKED").length;
  const totalSellable = totalCapacity - totalBlocked;

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addRow} className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Row ({String.fromCharCode(65 + rows.length)})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSeatsPerRow((prev) => prev + 1)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Column
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))} className="h-8 w-8">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.7))} className="h-8 w-8">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)} className="h-8 w-8">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected Seats Actions */}
        {selectedSeatIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-semibold text-foreground">Selected ({selectedSeatIds.length}):</span>
            <Button size="sm" onClick={() => applyCategoryToSelected("VIP", 750)} className="h-7 text-[11px] bg-amber-500 hover:bg-amber-600">
              Set VIP (৳750)
            </Button>
            <Button size="sm" onClick={() => applyCategoryToSelected("RECLINER", 950)} className="h-7 text-[11px] bg-purple-500 hover:bg-purple-600">
              Set Recliner (৳950)
            </Button>
            <Button size="sm" onClick={() => applyCategoryToSelected("REGULAR", 450)} className="h-7 text-[11px] variant-secondary">
              Set Regular (৳450)
            </Button>
            <Button size="sm" variant="destructive" onClick={() => applyStatusToSelected("BLOCKED")} className="h-7 text-[11px] gap-1">
              <Lock className="h-3 w-3" /> Block
            </Button>
          </div>
        )}
      </div>

      {/* Screen Curved Display Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-sm flex flex-col items-center">
        <div className="w-3/4 h-3 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full shadow-lg shadow-primary/20 mb-2" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Screen / Projection Area</span>

        {/* Interactive Canvas */}
        <div className="w-full overflow-auto py-8 flex justify-center">
          <div
            className="transition-transform duration-200 origin-top flex flex-col gap-3"
            style={{ transform: `scale(${zoom})` }}
          >
            {rows.map((row) => {
              const rowSeats = seats.filter((s) => s.row === row);
              return (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-6 text-center font-bold text-xs text-muted-foreground">{row}</span>
                  <div className="flex items-center gap-2">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const catStyle = CATEGORY_COLORS[seat.category];
                      const isBlocked = seat.status === "BLOCKED";

                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSelectSeat(seat.id)}
                          className={cn(
                            "h-9 w-9 rounded-lg border text-[11px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer relative group",
                            isBlocked
                              ? "bg-muted/80 text-muted-foreground border-border/60 opacity-40 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 scale-105"
                              : `${catStyle.bg} ${catStyle.text} ${catStyle.border} hover:scale-105`
                          )}
                        >
                          <span>{seat.number}</span>
                          <span className="text-[8px] opacity-80">{seat.category[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-center font-bold text-xs text-muted-foreground">{row}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border/60 w-full text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-slate-500/30 border border-slate-500/50" />
            <span className="text-muted-foreground">Regular (৳450)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-amber-500/30 border border-amber-500/50" />
            <span className="text-muted-foreground">VIP (৳750)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-purple-500/30 border border-purple-500/50" />
            <span className="text-muted-foreground">Recliner (৳950)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-rose-500/30 border border-rose-500/50" />
            <span className="text-muted-foreground">Couple (৳1,200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-muted opacity-50 border border-border" />
            <span className="text-muted-foreground">Blocked / Maintenance</span>
          </div>
        </div>
      </div>

      {/* Seat Layout Capacity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-foreground">{totalCapacity} Seats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Sellable Inventory</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-emerald-500">{totalSellable} Seats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Blocked / Reserved</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-amber-500">{totalBlocked} Seats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Max House Potential</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-primary">
              {formatCurrency(seats.reduce((acc, s) => acc + (s.status !== "BLOCKED" ? s.priceBDT : 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
