"use client";

import * as React from "react";
import {
  Plus,
  Minus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
  Unlock,
  Armchair,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Grid,
  Maximize2,
  CheckSquare,
  Square,
  Tv,
  Volume2,
  Info,
  Save,
  Building2,
  Film,
  Eye,
  Settings2,
  Wand2,
  RefreshCw,
  ShoppingBag,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";

export type SeatCategory = "REGULAR" | "VIP" | "RECLINER" | "COUPLE" | "ACCESSIBLE" | "FOUR_DX";
export type SeatStatus = "AVAILABLE" | "BLOCKED" | "HELD" | "BOOKED";

export interface SeatItem {
  id: string;
  row: string;
  number: number;
  category: SeatCategory;
  priceBDT: number;
  status: SeatStatus;
  sectionName: string;
  isAisleRight?: boolean;
}

export interface TheaterOption {
  id: string;
  name: string;
  city: string;
  screens: {
    id: string;
    name: string;
    type: "IMAX_3D" | "FOUR_DX" | "DOLBY_ATMOS" | "VIP_SUITE" | "REGULAR_2D";
    rowsCount: number;
    seatsPerRow: number;
    aisleCol: number;
  }[];
}

const THEATERS_DATA: TheaterOption[] = [
  {
    id: "v-1",
    name: "Star Cineplex - Bashundhara City",
    city: "Dhaka",
    screens: [
      { id: "s-1", name: "Hall 1 (IMAX 3D Laser)", type: "IMAX_3D", rowsCount: 10, seatsPerRow: 18, aisleCol: 9 },
      { id: "s-2", name: "Hall 2 (VIP Recliner Suite)", type: "VIP_SUITE", rowsCount: 4, seatsPerRow: 8, aisleCol: 4 },
      { id: "s-3", name: "Hall 3 (Dolby Atmos 2D)", type: "DOLBY_ATMOS", rowsCount: 8, seatsPerRow: 14, aisleCol: 7 },
      { id: "s-4", name: "Hall 4 (Standard 2D)", type: "REGULAR_2D", rowsCount: 7, seatsPerRow: 12, aisleCol: 6 },
    ],
  },
  {
    id: "v-2",
    name: "Blockbuster Cinemas - Jamuna Future Park",
    city: "Dhaka",
    screens: [
      { id: "s-5", name: "Cinema 1 (Atmosphere 3D)", type: "DOLBY_ATMOS", rowsCount: 9, seatsPerRow: 16, aisleCol: 8 },
      { id: "s-6", name: "Cinema 2 (4DX Motion Hall)", type: "FOUR_DX", rowsCount: 6, seatsPerRow: 12, aisleCol: 6 },
      { id: "s-7", name: "Cinema 3 (Executive Hall)", type: "VIP_SUITE", rowsCount: 5, seatsPerRow: 10, aisleCol: 5 },
    ],
  },
  {
    id: "v-3",
    name: "Silver Screen - Finlay Square",
    city: "Chattogram",
    screens: [
      { id: "s-8", name: "Platinum Recliner Hall", type: "VIP_SUITE", rowsCount: 5, seatsPerRow: 10, aisleCol: 5 },
      { id: "s-9", name: "Screen A (Standard 2D)", type: "REGULAR_2D", rowsCount: 8, seatsPerRow: 14, aisleCol: 7 },
    ],
  },
];

const CATEGORY_CONFIG: Record<
  SeatCategory,
  { name: string; price: number; bg: string; border: string; text: string; glow: string; icon: string }
> = {
  RECLINER: { name: "Recliner Plush", price: 950, bg: "bg-purple-950/70", border: "border-purple-500/60", text: "text-purple-300", glow: "shadow-purple-500/30", icon: "👑" },
  VIP: { name: "VIP Gold", price: 750, bg: "bg-amber-950/70", border: "border-amber-500/60", text: "text-amber-300", glow: "shadow-amber-500/30", icon: "💎" },
  FOUR_DX: { name: "4DX Motion", price: 1100, bg: "bg-cyan-950/70", border: "border-cyan-500/60", text: "text-cyan-300", glow: "shadow-cyan-500/30", icon: "🚀" },
  COUPLE: { name: "Couple Sofa", price: 1200, bg: "bg-rose-950/70", border: "border-rose-500/60", text: "text-rose-300", glow: "shadow-rose-500/30", icon: "💖" },
  ACCESSIBLE: { name: "Wheelchair", price: 450, bg: "bg-sky-950/70", border: "border-sky-500/60", text: "text-sky-300", glow: "shadow-sky-500/30", icon: "♿" },
  REGULAR: { name: "Regular", price: 450, bg: "bg-slate-900/80", border: "border-slate-700", text: "text-slate-300", glow: "shadow-slate-500/10", icon: "💺" },
};

export function SeatLayoutEditor() {
  // Theater & Screen Selection State
  const [selectedTheaterId, setSelectedTheaterId] = React.useState<string>(THEATERS_DATA[0].id);
  const [selectedScreenId, setSelectedScreenId] = React.useState<string>(THEATERS_DATA[0].screens[0].id);

  // Generator Config Parameters
  const [rows, setRows] = React.useState<string[]>([]);
  const [seatsPerRow, setSeatsPerRow] = React.useState(14);
  const [centerAisleAfter, setCenterAisleAfter] = React.useState(7);
  const [isCurvedScreen, setIsCurvedScreen] = React.useState(true);
  const [mode, setMode] = React.useState<"EDITOR" | "PREVIEW">("EDITOR");

  // Seats State & Selection
  const [seats, setSeats] = React.useState<SeatItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = React.useState<string[]>([]);
  const [customerBookedIds, setCustomerBookedIds] = React.useState<string[]>([]);
  const [zoom, setZoom] = React.useState(1.0);
  const [customPriceInput, setCustomPriceInput] = React.useState<string>("600");
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Derived Active Objects
  const activeTheater = THEATERS_DATA.find((t) => t.id === selectedTheaterId) || THEATERS_DATA[0];
  const activeScreen = activeTheater.screens.find((s) => s.id === selectedScreenId) || activeTheater.screens[0];

  // Dynamic Generator Algorithm based on Theater & Screen Specifications
  const generateSeatsForScreen = React.useCallback(
    (screenType: string, rowsCount: number, colsCount: number, aisleGap: number) => {
      const generatedRows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));
      setRows(generatedRows);
      setSeatsPerRow(colsCount);
      setCenterAisleAfter(aisleGap);

      const generatedSeats: SeatItem[] = [];

      generatedRows.forEach((row, rowIndex) => {
        for (let num = 1; num <= colsCount; num++) {
          let cat: SeatCategory = "REGULAR";
          let price = 450;
          let section = "General Ground Section";

          if (screenType === "IMAX_3D") {
            if (rowIndex <= 1) {
              cat = "RECLINER";
              price = 1200;
              section = "IMAX Premium Recliner Tier";
            } else if (rowIndex <= 4) {
              cat = "VIP";
              price = 850;
              section = "IMAX Gold Tier";
            } else {
              cat = "REGULAR";
              price = 550;
              section = "IMAX Standard Tier";
            }
          } else if (screenType === "VIP_SUITE") {
            cat = "RECLINER";
            price = 1500;
            section = "Private VIP Suite";
            if (row === "D") {
              cat = "COUPLE";
              price = 2500;
              section = "VIP Couple Lounger";
            }
          } else if (screenType === "FOUR_DX") {
            cat = "FOUR_DX";
            price = 1100;
            section = "4DX Motion Pod Section";
          } else if (screenType === "DOLBY_ATMOS") {
            if (rowIndex <= 1) {
              cat = "RECLINER";
              price = 950;
              section = "Balcony Recliner Section";
            } else if (rowIndex <= 3) {
              cat = "VIP";
              price = 750;
              section = "Executive VIP Section";
            } else {
              cat = "REGULAR";
              price = 450;
              section = "Main Floor Section";
            }
          } else {
            if (rowIndex === 0) {
              cat = "VIP";
              price = 600;
              section = "Executive Row";
            } else {
              cat = "REGULAR";
              price = 450;
              section = "Standard Floor";
            }
          }

          // Corner Wheelchair Slot
          if (rowIndex === generatedRows.length - 1 && (num === 1 || num === colsCount)) {
            cat = "ACCESSIBLE";
            price = 450;
            section = "Wheelchair Accessible";
          }

          generatedSeats.push({
            id: `${row}-${num}`,
            row,
            number: num,
            category: cat,
            priceBDT: price,
            status: "AVAILABLE",
            sectionName: section,
            isAisleRight: num === aisleGap,
          });
        }
      });

      setSeats(generatedSeats);
      setSelectedSeatIds([]);
      setCustomerBookedIds([]);
    },
    []
  );

  // Trigger seat generation when theater/screen changes
  React.useEffect(() => {
    generateSeatsForScreen(activeScreen.type, activeScreen.rowsCount, activeScreen.seatsPerRow, activeScreen.aisleCol);
  }, [selectedTheaterId, selectedScreenId, activeScreen, generateSeatsForScreen]);

  // Selection Logic
  const toggleSelectSeat = (id: string) => {
    if (mode === "PREVIEW") {
      setCustomerBookedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
      return;
    }
    setSelectedSeatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectRow = (rowLabel: string) => {
    if (mode === "PREVIEW") return;
    const rowSeatIds = seats.filter((s) => s.row === rowLabel).map((s) => s.id);
    const allSelected = rowSeatIds.every((id) => selectedSeatIds.includes(id));
    if (allSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !rowSeatIds.includes(id)));
    } else {
      setSelectedSeatIds((prev) => Array.from(new Set([...prev, ...rowSeatIds])));
    }
  };

  const selectColumn = (colNum: number) => {
    if (mode === "PREVIEW") return;
    const colSeatIds = seats.filter((s) => s.number === colNum).map((s) => s.id);
    const allSelected = colSeatIds.every((id) => selectedSeatIds.includes(id));
    if (allSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !colSeatIds.includes(id)));
    } else {
      setSelectedSeatIds((prev) => Array.from(new Set([...prev, ...colSeatIds])));
    }
  };

  const selectAll = () => {
    if (selectedSeatIds.length === seats.length) {
      setSelectedSeatIds([]);
    } else {
      setSelectedSeatIds(seats.map((s) => s.id));
    }
  };

  const applyCategoryToSelected = (category: SeatCategory, price?: number) => {
    const targetPrice = price ?? CATEGORY_CONFIG[category].price;
    setSeats((prev) =>
      prev.map((s) => (selectedSeatIds.includes(s.id) ? { ...s, category, priceBDT: targetPrice } : s))
    );
    setSelectedSeatIds([]);
  };

  const applyCustomPriceToSelected = () => {
    const parsed = parseFloat(customPriceInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setSeats((prev) =>
      prev.map((s) => (selectedSeatIds.includes(s.id) ? { ...s, priceBDT: parsed } : s))
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
    const newRows = [...rows, nextChar];
    generateSeatsForScreen(activeScreen.type, newRows.length, seatsPerRow, centerAisleAfter);
  };

  const removeRow = () => {
    if (rows.length <= 1) return;
    generateSeatsForScreen(activeScreen.type, rows.length - 1, seatsPerRow, centerAisleAfter);
  };

  const addCol = () => {
    generateSeatsForScreen(activeScreen.type, rows.length, seatsPerRow + 1, centerAisleAfter);
  };

  const removeCol = () => {
    if (seatsPerRow <= 2) return;
    generateSeatsForScreen(activeScreen.type, rows.length, seatsPerRow - 1, centerAisleAfter);
  };

  const saveLayout = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Metrics
  const totalCapacity = seats.length;
  const totalBlocked = seats.filter((s) => s.status === "BLOCKED").length;
  const totalSellable = totalCapacity - totalBlocked;
  const totalHouseGross = seats.reduce((acc, s) => acc + (s.status !== "BLOCKED" ? s.priceBDT : 0), 0);

  const previewTotalBDT = customerBookedIds.reduce((acc, id) => {
    const s = seats.find((item) => item.id === id);
    return acc + (s ? s.priceBDT : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Layout & seat pricing grid for <strong>{activeTheater.name} - {activeScreen.name}</strong> saved successfully!
          </div>
        </div>
      )}

      {/* Dynamic Theater & Screen Selector Header */}
      <div className="bg-card/90 p-5 rounded-2xl border border-border/80 shadow-md backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black tracking-tight text-foreground">Dynamic Multiplex Generator</h2>
            </div>
            <p className="text-xs text-muted-foreground">Select theater branch and screen specifications to auto-generate seat matrices.</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/30 p-1">
              <button
                onClick={() => setMode("EDITOR")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                  mode === "EDITOR" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings2 className="h-3.5 w-3.5" /> Admin Generator
              </button>
              <button
                onClick={() => setMode("PREVIEW")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                  mode === "PREVIEW" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-3.5 w-3.5" /> Customer Booking Preview
              </button>
            </div>
          </div>
        </div>

        {/* Theater Branch & Screen Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-primary" /> Cinema Branch Location
            </label>
            <select
              value={selectedTheaterId}
              onChange={(e) => {
                const newT = THEATERS_DATA.find((t) => t.id === e.target.value) || THEATERS_DATA[0];
                setSelectedTheaterId(newT.id);
                setSelectedScreenId(newT.screens[0].id);
              }}
              className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {THEATERS_DATA.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1">
              <Film className="h-3.5 w-3.5 text-emerald-400" /> Screen & Hall Format
            </label>
            <select
              value={selectedScreenId}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {activeTheater.screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} • {s.type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1">
              <Wand2 className="h-3.5 w-3.5 text-amber-400" /> Preset Generator Engine
            </label>
            <Button
              onClick={() => generateSeatsForScreen(activeScreen.type, activeScreen.rowsCount, activeScreen.seatsPerRow, activeScreen.aisleCol)}
              variant="outline"
              className="w-full h-9 text-xs font-bold gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-Generate Default Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Controls Bar (Active only in EDITOR mode) */}
      {mode === "EDITOR" && (
        <div className="bg-card/90 p-4 rounded-2xl border border-border/80 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Grid Modifier Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Rows:</span>
                <Button variant="ghost" size="icon-sm" onClick={removeRow} title="Remove Row">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-bold text-foreground px-1">{rows.length}</span>
                <Button variant="ghost" size="icon-sm" onClick={addRow} title="Add Row">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Cols:</span>
                <Button variant="ghost" size="icon-sm" onClick={removeCol} title="Remove Column">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-bold text-foreground px-1">{seatsPerRow}</span>
                <Button variant="ghost" size="icon-sm" onClick={addCol} title="Add Column">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-semibold">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Screen Arc:</span>
                <button
                  onClick={() => setIsCurvedScreen(!isCurvedScreen)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {isCurvedScreen ? "Curved IMAX Arc" : "Flat Screen"}
                </button>
              </div>
            </div>

            {/* Canvas Zoom & Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/60">
                <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(z + 0.1, 1.4))} title="Zoom In">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[10px] font-mono font-bold px-2">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.6))} title="Zoom Out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setZoom(1.0)} title="Reset Zoom">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <Button onClick={saveLayout} size="sm" className="h-8 text-xs font-bold gap-1.5 shadow-md">
                <Save className="h-3.5 w-3.5" /> Save Configuration
              </Button>
            </div>
          </div>

          {/* Quick Category & Status Assigners */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <span className="text-xs font-bold text-muted-foreground mr-1">Assign Category:</span>
            {(Object.keys(CATEGORY_CONFIG) as SeatCategory[]).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const disabled = selectedSeatIds.length === 0;

              return (
                <button
                  key={catKey}
                  disabled={disabled}
                  onClick={() => applyCategoryToSelected(catKey)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer shadow-xs",
                    cfg.bg,
                    cfg.border,
                    cfg.text,
                    disabled ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                  )}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.name}</span>
                  <span className="opacity-70 font-mono text-[9px]">({formatCurrency(cfg.price)})</span>
                </button>
              );
            })}

            <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

            <Button
              disabled={selectedSeatIds.length === 0}
              variant="destructive"
              size="xs"
              onClick={() => applyStatusToSelected("BLOCKED")}
              className="h-7 text-[11px] font-bold gap-1"
            >
              <Lock className="h-3 w-3" /> Block
            </Button>

            <Button
              disabled={selectedSeatIds.length === 0}
              variant="outline"
              size="xs"
              onClick={() => applyStatusToSelected("AVAILABLE")}
              className="h-7 text-[11px] font-bold gap-1 text-emerald-400 border-emerald-500/30"
            >
              <Unlock className="h-3 w-3" /> Available
            </Button>
          </div>
        </div>
      )}

      {/* Main Interactive Seat Canvas */}
      <Card className="overflow-hidden border border-border/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl relative">
        {/* Speaker Indicators */}
        <div className="absolute top-4 left-6 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
          <Volume2 className="h-3.5 w-3.5 text-primary/60" /> Left Surround
        </div>
        <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
          <Volume2 className="h-3.5 w-3.5 text-primary/60" /> Right Surround
        </div>

        {/* Projection Screen Representation */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 relative">
          <div
            className={cn(
              "w-full max-w-2xl h-4 bg-gradient-to-r from-primary/10 via-primary to-primary/10 shadow-[0_10px_30px_rgba(59,130,246,0.5)] border-t border-primary/50 relative overflow-hidden transition-all duration-300",
              isCurvedScreen ? "rounded-[100%]" : "rounded-md"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Tv className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary/90">
              {activeTheater.name} • {activeScreen.name}
            </span>
          </div>
        </div>

        {/* Seat Layout Grid */}
        <div className="w-full overflow-auto py-6 px-4 flex justify-center">
          <div
            className="transition-transform duration-200 origin-top flex flex-col gap-3.5 py-2"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Column Numbers */}
            <div className="flex items-center gap-2 justify-center pl-8 pr-8">
              {Array.from({ length: seatsPerRow }).map((_, colIdx) => {
                const colNum = colIdx + 1;
                const isAisle = colNum === centerAisleAfter;

                return (
                  <React.Fragment key={colNum}>
                    <button
                      onClick={() => selectColumn(colNum)}
                      className="w-9 text-center font-mono font-bold text-[11px] text-muted-foreground/70 hover:text-primary transition-colors cursor-pointer"
                    >
                      {colNum}
                    </button>
                    {isAisle && <div className="w-8 shrink-0 text-center text-[9px] font-bold text-muted-foreground/30 uppercase">Aisle</div>}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Seat Rows */}
            {rows.map((rowLabel) => {
              const rowSeats = seats.filter((s) => s.row === rowLabel);

              return (
                <div key={rowLabel} className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => selectRow(rowLabel)}
                    className="w-7 h-9 rounded bg-muted/30 border border-border/40 hover:bg-primary/20 hover:text-primary transition-colors font-bold text-xs text-foreground flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    {rowLabel}
                  </button>

                  <div className="flex items-center gap-2">
                    {rowSeats.map((seat) => {
                      const isEditorSelected = selectedSeatIds.includes(seat.id);
                      const isCustomerBooked = customerBookedIds.includes(seat.id);
                      const cfg = CATEGORY_CONFIG[seat.category];
                      const isBlocked = seat.status === "BLOCKED";

                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            onClick={() => toggleSelectSeat(seat.id)}
                            className={cn(
                              "h-9 w-9 rounded-lg border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center cursor-pointer relative group shadow-sm",
                              isBlocked
                                ? "bg-muted/80 text-muted-foreground/40 border-border/40 opacity-40 cursor-not-allowed"
                                : mode === "PREVIEW" && isCustomerBooked
                                ? "bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400 scale-110 shadow-lg shadow-emerald-500/30"
                                : mode === "EDITOR" && isEditorSelected
                                ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 font-black shadow-lg shadow-primary/30"
                                : `${cfg.bg} ${cfg.text} ${cfg.border} hover:scale-110 ${cfg.glow}`
                            )}
                            title={`${seat.row}${seat.number} • ${cfg.name} • ${formatCurrency(seat.priceBDT)}`}
                          >
                            <span className="text-[10px] leading-none font-bold">{seat.number}</span>
                            <span className="text-[9px] leading-none mt-0.5 opacity-80">{cfg.icon}</span>
                          </button>

                          {seat.isAisleRight && <div className="w-8 shrink-0" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => selectRow(rowLabel)}
                    className="w-7 h-9 rounded bg-muted/30 border border-border/40 hover:bg-primary/20 hover:text-primary transition-colors font-bold text-xs text-foreground flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    {rowLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 border-t border-border/40 bg-slate-950/90 text-xs">
          {(Object.keys(CATEGORY_CONFIG) as SeatCategory[]).map((catKey) => {
            const cfg = CATEGORY_CONFIG[catKey];
            return (
              <div key={catKey} className="flex items-center gap-2">
                <div className={cn("h-4 w-4 rounded border flex items-center justify-center text-[9px]", cfg.bg, cfg.border)}>
                  {cfg.icon}
                </div>
                <span className="text-muted-foreground font-medium">
                  {cfg.name} <span className="font-bold text-foreground">({formatCurrency(cfg.price)})</span>
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Customer Booking Preview Summary Bar */}
      {mode === "PREVIEW" && (
        <Card className="bg-emerald-950/20 border-emerald-500/30 p-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Customer Booking Simulation</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selected {customerBookedIds.length} Seats:{" "}
                <span className="font-mono font-bold text-foreground">
                  {customerBookedIds.map((id) => id).join(", ") || "None"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Ticket Price</span>
                <span className="text-xl font-black text-emerald-400">{formatCurrency(previewTotalBDT)}</span>
              </div>
              <Button disabled={customerBookedIds.length === 0} className="h-9 text-xs font-bold gap-1.5 bg-emerald-500 hover:bg-emerald-600">
                <ShoppingBag className="h-4 w-4" /> Proceed to Test Checkout
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* House Capacity & Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Total Screen Capacity</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-3xl font-black text-foreground">{totalCapacity} Seats</p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">{rows.length} Rows × {seatsPerRow} Cols</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Sellable Inventory</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-3xl font-black text-emerald-400">{totalSellable} Seats</p>
            <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">
              {Math.round((totalSellable / (totalCapacity || 1)) * 100)}% available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Blocked Seats</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-3xl font-black text-rose-400">{totalBlocked} Seats</p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">Maintenance / Wheelchair</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Max House Potential</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-3xl font-black text-amber-400">{formatCurrency(totalHouseGross)}</p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">Gross revenue per show</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
