"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Grid3X3,
  Sliders,
  Check,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Tv,
  Eye,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Save,
  Building2,
  Film,
  Filter,
  RefreshCw,
  CheckCircle2,
  Paintbrush,
  Maximize2,
  Grid,
  Layers,
  Wand2,
  Edit3,
  TrendingUp,
  Percent,
  Copy,
  FileCode,
  Volume2,
  Download,
  Upload,
  Zap,
} from "lucide-react";
import { useTicketingStore } from "../../stores/ticketing.store";
import { useAuthStore } from "../../stores/auth.store";
import { can as checkPermission } from "../../lib/auth/permissions";
import {
  SeatLayout,
  SeatCategory,
  SeatItem,
  SeatPhysicalStatus,
} from "../../types";
import { PageHeader } from "../../components/shared/PageHeader";
import { Badge } from "../../components/shared/Badge";
import { Can } from "../../components/shared/Can";
import { formatCurrency } from "../../lib/utils";
import { useCitiesQuery, useVenuesQuery } from "../../hooks/useAdminQueries";
import { apiClient } from "../../lib/api/client";
import { useQuery } from "@tanstack/react-query";

export interface SeatType {
  id: string;
  screenId: string;
  rowLabel: string;
  columnNumber: number;
  seatNumber: string;
  type: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  priceMultiplier: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export const SeatLayoutEditor: React.FC = () => {
  const { seatLayouts, updateSeatLayout, toggleSeatStatus, updateSeatPrice } =
    useTicketingStore();
  const user = useAuthStore((state) => state.user);

  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const { data: venuesList = [], isFetching: isVenuesFetching } =
    useVenuesQuery(selectedCityId);

  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedScreenId, setSelectedScreenId] = useState<string>("");

  // Dynamic Cities & Venues API Query Hooks
  const { data: citiesList = [] } = useCitiesQuery();

  // get all seats using screenId
  const { data: seatsList = [] } = useQuery({
    queryKey: ["seats", selectedScreenId],
    queryFn: async () => {
      const response = (await apiClient.get(
        `/screens/${selectedScreenId}/seat-layout`,
      )) as SeatType[];
      return response;
    },
    enabled: !!selectedScreenId,
  });

  useEffect(() => {
    console.log("seatsList", seatsList);
  }, [seatsList]);

  useEffect(() => {
    if (
      citiesList.length > 0 &&
      (!selectedCityId || !citiesList.some((c) => c.id === selectedCityId))
    ) {
      setSelectedCityId(citiesList[0].id);
    }
  }, [citiesList, selectedCityId]);

  useEffect(() => {
    if (venuesList.length > 0) {
      if (
        !selectedVenueId ||
        !venuesList.some((v) => v.id === selectedVenueId)
      ) {
        setSelectedVenueId(venuesList[0].id);
        const screens = venuesList[0].screens || [];
        if (screens.length > 0) {
          setSelectedScreenId(screens[0].id);
        }
      }
    }
  }, [venuesList, selectedVenueId]);

  const activeVenue =
    venuesList.find((v) => v.id === selectedVenueId) || venuesList[0];
  const activeScreensList = activeVenue?.screens || [
    {
      id: "s-101",
      name: "Hall 1 (IMAX 3D Laser)",
      supportedFormats: ["IMAX", "3D"],
      totalSeats: 180,
    },
    {
      id: "s-102",
      name: "Hall 2 (VIP Recliner Suite)",
      supportedFormats: ["VIP", "2D"],
      totalSeats: 60,
    },
  ];
  const activeScreen =
    activeScreensList.find((s: any) => s.id === selectedScreenId) ||
    activeScreensList[0];

  // Editor Navigation Tab: canvas | pricing | geometry | json
  const [activeTab, setActiveTab] = useState<
    "canvas" | "pricing" | "geometry" | "json"
  >("canvas");

  // Editor State
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(
    seatLayouts[0]?.id || "layout-imax-hyd-1",
  );
  const [activeTool, setActiveTool] = useState<
    SeatCategory | "BLOCKED" | "WALKWAY"
  >("PLATINUM");
  const [filterCategory, setFilterCategory] = useState<SeatCategory | "ALL">(
    "ALL",
  );
  const [hoveredSeat, setHoveredSeat] = useState<SeatItem | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mode, setMode] = useState<"EDITOR" | "PREVIEW">("EDITOR");
  const [customerBookedIds, setCustomerBookedIds] = useState<string[]>([]);
  const [isCurvedScreen, setIsCurvedScreen] = useState(true);
  const [jsonCopied, setJsonCopied] = useState(false);

  // Pricing Surge Multipliers
  const [weekendMultiplier, setWeekendMultiplier] = useState<number>(1.2);
  const [holidayMultiplier, setHolidayMultiplier] = useState<number>(1.5);

  // Category Price State (editable prices for seat types)
  const [categoryPrices, setCategoryPrices] = useState<
    Record<SeatCategory, number>
  >({
    RECLINER: 850,
    PLATINUM: 550,
    GOLD: 420,
    SILVER: 320,
    VIP: 990,
    COUPLE: 1200,
    ACCESSIBLE: 320,
  });

  const currentLayout =
    seatLayouts.find((l) => l.id === selectedLayoutId) || seatLayouts[0];

  if (!currentLayout) return null;

  const rows = Array.from(
    new Set(currentLayout.seats.map((s) => s.row)),
  ).sort();
  const colsCount = currentLayout.colsCount || 14;
  const cols = Array.from({ length: colsCount }, (_, i) => i + 1);

  // Category Configuration
  const categoryConfig: Record<
    SeatCategory,
    { name: string; color: string; border: string; bg: string; icon: string }
  > = {
    RECLINER: {
      name: "Royal Recliner",
      color: "#8b5cf6",
      border: "border-purple-500",
      bg: "bg-purple-950/80 text-purple-200",
      icon: "👑",
    },
    PLATINUM: {
      name: "Platinum Prime",
      color: "#3b82f6",
      border: "border-blue-500",
      bg: "bg-blue-950/80 text-blue-200",
      icon: "💎",
    },
    GOLD: {
      name: "Gold Executive",
      color: "#eab308",
      border: "border-amber-500",
      bg: "bg-amber-950/80 text-amber-200",
      icon: "🌟",
    },
    SILVER: {
      name: "Silver Standard",
      color: "#64748b",
      border: "border-slate-500",
      bg: "bg-slate-900 text-slate-300",
      icon: "💺",
    },
    VIP: {
      name: "VIP Club",
      color: "#ec4899",
      border: "border-pink-500",
      bg: "bg-pink-950/80 text-pink-200",
      icon: "🔥",
    },
    COUPLE: {
      name: "Couple Lounger",
      color: "#f43f5e",
      border: "border-rose-500",
      bg: "bg-rose-950/80 text-rose-200",
      icon: "💖",
    },
    ACCESSIBLE: {
      name: "Accessible Space",
      color: "#10b981",
      border: "border-emerald-500",
      bg: "bg-emerald-950/80 text-emerald-200",
      icon: "♿",
    },
  };

  // Update Category Price and sync layout
  const handleCategoryPriceChange = (cat: SeatCategory, newPrice: number) => {
    setCategoryPrices((prev) => ({ ...prev, [cat]: newPrice }));
    const updatedSeats = currentLayout.seats.map((s) =>
      s.category === cat ? { ...s, basePrice: newPrice } : s,
    );
    updateSeatLayout(currentLayout.id, { seats: updatedSeats });
  };

  // Toggle Seat Selection
  const toggleSeatSelection = (seatId: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  // Click single seat painter
  const handleSeatClick = (seat: SeatItem) => {
    if (mode === "PREVIEW") {
      setCustomerBookedIds((prev) =>
        prev.includes(seat.id)
          ? prev.filter((i) => i !== seat.id)
          : [...prev, seat.id],
      );
      return;
    }

    if (!checkPermission(user, "seat:update")) return;

    if (activeTool === "BLOCKED") {
      toggleSeatStatus(currentLayout.id, seat.id);
      return;
    }

    if (activeTool === "WALKWAY") {
      const updatedSeats = currentLayout.seats.map((s) => {
        if (s.id === seat.id) {
          const isWalkway = s.type === "WALKWAY";
          return {
            ...s,
            type: isWalkway ? ("STANDARD" as const) : ("WALKWAY" as const),
            label: isWalkway ? `${s.row}${s.col}` : "",
          };
        }
        return s;
      });
      updateSeatLayout(currentLayout.id, { seats: updatedSeats });
      return;
    }

    const updatedSeats = currentLayout.seats.map((s) => {
      if (s.id === seat.id) {
        let seatType: SeatItem["type"] = "STANDARD";
        if (activeTool === "ACCESSIBLE") seatType = "WHEELCHAIR";
        else if (activeTool === "RECLINER") seatType = "RECLINER";
        else if (activeTool === "COUPLE") seatType = "COUPLE_LEFT";

        return {
          ...s,
          category: activeTool as SeatCategory,
          basePrice: categoryPrices[activeTool as SeatCategory] || 350,
          type: seatType,
        };
      }
      return s;
    });

    updateSeatLayout(currentLayout.id, { seats: updatedSeats });
  };

  // Row Painter (paint entire row)
  const paintEntireRow = (rowLabel: string) => {
    if (!checkPermission(user, "seat:update") || mode === "PREVIEW") return;

    const updatedSeats = currentLayout.seats.map((s) => {
      if (s.row !== rowLabel) return s;

      if (activeTool === "BLOCKED") {
        return { ...s, status: "BLOCKED" as const };
      }
      if (activeTool === "WALKWAY") {
        return { ...s, type: "WALKWAY" as const, label: "" };
      }

      let seatType: SeatItem["type"] = "STANDARD";
      if (activeTool === "ACCESSIBLE") seatType = "WHEELCHAIR";
      else if (activeTool === "RECLINER") seatType = "RECLINER";
      else if (activeTool === "COUPLE") seatType = "COUPLE_LEFT";

      return {
        ...s,
        category: activeTool as SeatCategory,
        basePrice: categoryPrices[activeTool as SeatCategory] || 350,
        type: seatType,
        status: "AVAILABLE" as const,
      };
    });

    updateSeatLayout(currentLayout.id, { seats: updatedSeats });
  };

  // Column Painter (paint entire column)
  const paintEntireColumn = (colNum: number) => {
    if (!checkPermission(user, "seat:update") || mode === "PREVIEW") return;

    const updatedSeats = currentLayout.seats.map((s) => {
      if (s.col !== colNum) return s;

      if (activeTool === "BLOCKED") {
        return { ...s, status: "BLOCKED" as const };
      }
      if (activeTool === "WALKWAY") {
        return { ...s, type: "WALKWAY" as const, label: "" };
      }

      let seatType: SeatItem["type"] = "STANDARD";
      if (activeTool === "ACCESSIBLE") seatType = "WHEELCHAIR";
      else if (activeTool === "RECLINER") seatType = "RECLINER";

      return {
        ...s,
        category: activeTool as SeatCategory,
        basePrice: categoryPrices[activeTool as SeatCategory] || 350,
        type: seatType,
        status: "AVAILABLE" as const,
      };
    });

    updateSeatLayout(currentLayout.id, { seats: updatedSeats });
  };

  // Auto-Generate Layout by Category Tiers
  const autoGenerateLayoutByTiers = () => {
    if (!checkPermission(user, "seat:update")) return;

    const updatedSeats = currentLayout.seats.map((s) => {
      const rowIndex = rows.indexOf(s.row);
      let cat: SeatCategory = "SILVER";

      if (rowIndex <= 1) cat = "RECLINER";
      else if (rowIndex <= 3) cat = "PLATINUM";
      else if (rowIndex <= 5) cat = "GOLD";
      else cat = "SILVER";

      if (s.type === "WALKWAY") return s;

      return {
        ...s,
        category: cat,
        basePrice: categoryPrices[cat] || 350,
        status: "AVAILABLE" as const,
      };
    });

    updateSeatLayout(currentLayout.id, { seats: updatedSeats });
  };

  // Add / Remove Row Controls
  const addRowToGrid = () => {
    const nextRowChar = String.fromCharCode(65 + rows.length);
    const newSeats: SeatItem[] = cols.map((c) => ({
      id: `${currentLayout.id}-${nextRowChar}-${c}`,
      row: nextRowChar,
      col: c,
      label: `${nextRowChar}${c}`,
      category: "SILVER",
      basePrice: categoryPrices.SILVER,
      status: "AVAILABLE",
      type: "STANDARD",
    }));

    updateSeatLayout(currentLayout.id, {
      rowsCount: rows.length + 1,
      totalSeats: currentLayout.totalSeats + colsCount,
      seats: [...currentLayout.seats, ...newSeats],
    });
  };

  const removeRowFromGrid = () => {
    if (rows.length <= 1) return;
    const lastRowChar = rows[rows.length - 1];
    const filteredSeats = currentLayout.seats.filter(
      (s) => s.row !== lastRowChar,
    );
    updateSeatLayout(currentLayout.id, {
      rowsCount: rows.length - 1,
      totalSeats: filteredSeats.filter((s) => s.type !== "WALKWAY").length,
      seats: filteredSeats,
    });
  };

  // Add / Remove Col Controls
  const addColToGrid = () => {
    const newColNum = colsCount + 1;
    const newSeats: SeatItem[] = rows.map((r) => ({
      id: `${currentLayout.id}-${r}-${newColNum}`,
      row: r,
      col: newColNum,
      label: `${r}${newColNum}`,
      category: "SILVER",
      basePrice: categoryPrices.SILVER,
      status: "AVAILABLE",
      type: "STANDARD",
    }));

    updateSeatLayout(currentLayout.id, {
      colsCount: newColNum,
      totalSeats: currentLayout.totalSeats + rows.length,
      seats: [...currentLayout.seats, ...newSeats],
    });
  };

  const removeColFromGrid = () => {
    if (colsCount <= 2) return;
    const filteredSeats = currentLayout.seats.filter(
      (s) => s.col !== colsCount,
    );
    updateSeatLayout(currentLayout.id, {
      colsCount: colsCount - 1,
      totalSeats: filteredSeats.filter((s) => s.type !== "WALKWAY").length,
      seats: filteredSeats,
    });
  };

  const saveLayoutToServer = async () => {
    setIsSaving(true);
    try {
      if (activeVenue && activeScreen) {
        await apiClient
          .post("/screens/layout", {
            venueId: activeVenue.id,
            name: activeScreen.name,
            totalSeats: currentLayout.totalSeats,
            rows: rows.map((r) => ({
              rowLabel: r,
              seatsCount: colsCount,
            })),
          })
          .catch(() => null);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics Calculation
  const totalRevenuePotential = currentLayout.seats
    .filter((s) => s.type !== "WALKWAY" && s.status !== "BLOCKED")
    .reduce((sum, s) => sum + s.basePrice, 0);

  const weekendRevenuePotential = totalRevenuePotential * weekendMultiplier;
  const holidayRevenuePotential = totalRevenuePotential * holidayMultiplier;

  const activeSeatsCount = currentLayout.seats.filter(
    (s) => s.type !== "WALKWAY" && s.status !== "BLOCKED",
  ).length;
  const blockedSeatsCount = currentLayout.seats.filter(
    (s) => s.status === "BLOCKED",
  ).length;

  const previewSelectedTotal = customerBookedIds.reduce((acc, id) => {
    const s = currentLayout.seats.find((item) => item.id === id);
    return acc + (s ? s.basePrice : 0);
  }, 0);

  // Filtered Category Seat Count & Revenue
  const filteredCategoryCount = currentLayout.seats.filter(
    (s) =>
      s.type !== "WALKWAY" &&
      (filterCategory === "ALL" || s.category === filterCategory),
  ).length;

  const filteredCategoryRevenue = currentLayout.seats
    .filter(
      (s) =>
        s.type !== "WALKWAY" &&
        s.status !== "BLOCKED" &&
        (filterCategory === "ALL" || s.category === filterCategory),
    )
    .reduce((acc, s) => acc + s.basePrice, 0);

  const exportSchemaJSON = JSON.stringify(
    {
      theaterId: activeVenue?.id,
      theaterName: activeVenue?.name,
      screenId: activeScreen?.id,
      screenName: activeScreen?.name,
      totalSeats: currentLayout.totalSeats,
      rowsCount: rows.length,
      columnsCount: colsCount,
      isCurvedScreen,
      pricingRules: {
        weekendMultiplier,
        holidayMultiplier,
      },
      seatsLayout: currentLayout.seats.map((s) => ({
        id: s.id,
        row: s.row,
        col: s.col,
        label: s.label,
        category: s.category,
        basePrice: s.basePrice,
        status: s.status,
        type: s.type,
      })),
    },
    null,
    2,
  );

  const copyJSONPayload = () => {
    navigator.clipboard.writeText(exportSchemaJSON);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Visual Seat Layout & Tier Matrix Designer"
        description="Studio auditorium seat map editor, tier categorizations, surge rules, and physical lock controls."
        actions={
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-1">
              <button
                onClick={() => setMode("EDITOR")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === "EDITOR"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Designer Mode
              </button>
              <button
                onClick={() => setMode("PREVIEW")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === "PREVIEW"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Customer Preview
              </button>
            </div>

            <button
              onClick={saveLayoutToServer}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Server Layout"}</span>
            </button>
          </div>
        }
      />

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" /> Layout saved to server
          successfully for{" "}
          <strong>
            {activeVenue?.name} - {activeScreen?.name}
          </strong>
          !
        </div>
      )}

      {/* Dynamic City, Venue & Navigation Tabs Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-300">City:</span>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                {citiesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Venue:</span>
              <select
                value={selectedVenueId}
                onChange={(e) => {
                  setSelectedVenueId(e.target.value);
                  const targetV = venuesList.find(
                    (v) => v.id === e.target.value,
                  );
                  if (
                    targetV &&
                    targetV.screens &&
                    targetV.screens.length > 0
                  ) {
                    setSelectedScreenId(targetV.screens[0].id);
                  }
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                {venuesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Screen:</span>
              <select
                value={selectedScreenId}
                onChange={(e) => setSelectedScreenId(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                {activeScreensList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Layout Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              Auditorium Preset:
            </span>
            <select
              value={selectedLayoutId}
              onChange={(e) => setSelectedLayoutId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              {seatLayouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.totalSeats} seats)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "canvas"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <Grid className="h-3.5 w-3.5" /> Interactive Canvas & Seat Grid
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pricing"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" /> Tier Matrix & Surge Rules
          </button>
          <button
            onClick={() => setActiveTab("geometry")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "geometry"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <Tv className="h-3.5 w-3.5" /> Hall Architecture Specs
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "json"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" /> JSON Schema Payload
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CANVAS & SEAT GRID */}
      {activeTab === "canvas" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Seat Type Filter & Dynamic Pricing Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Filter / Display Seat Type:
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-400">
                Showing{" "}
                <strong className="text-white">
                  {filteredCategoryCount} seats
                </strong>{" "}
                • Category Revenue:{" "}
                <strong className="text-emerald-400">
                  {formatCurrency(filteredCategoryRevenue)}
                </strong>
              </div>
            </div>

            {/* Seat Type Filter Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterCategory("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  filterCategory === "ALL"
                    ? "bg-rose-600 text-white border-rose-500 shadow-md"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                All Seat Types ({currentLayout.totalSeats})
              </button>

              {(Object.keys(categoryConfig) as SeatCategory[]).map((catKey) => {
                const cfg = categoryConfig[catKey];
                const isSelected = filterCategory === catKey;
                const count = currentLayout.seats.filter(
                  (s) => s.category === catKey && s.type !== "WALKWAY",
                ).length;

                return (
                  <button
                    key={catKey}
                    onClick={() => setFilterCategory(catKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                      isSelected
                        ? "bg-slate-800 text-white border-rose-500 ring-1 ring-rose-500 shadow-md"
                        : `${cfg.bg} ${cfg.border} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <span>
                      {cfg.icon} {cfg.name}
                    </span>
                    <span className="font-mono text-[11px] font-extrabold text-amber-300">
                      (৳{categoryPrices[catKey]})
                    </span>
                    <span className="text-[10px] opacity-70">[{count}]</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Editor Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Left 3 Cols: Interactive Cinema Stage & Seat Map */}
            <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col items-center select-none overflow-x-auto relative">
              {/* Cinema Screen Curve */}
              <div className="mb-8 w-full max-w-xl text-center">
                <div className="relative mx-auto h-5 w-4/5 rounded-t-[100px] border-t-4 border-rose-500/80 bg-gradient-to-b from-rose-500/20 to-transparent shadow-[0_-8px_24px_rgba(244,63,94,0.3)] flex items-center justify-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {activeVenue?.name || "Star Cineplex"} •{" "}
                    {activeScreen?.name || "IMAX 3D Screen"} ⬇
                  </span>
                </div>
              </div>

              {/* Interactive Seat Grid Matrix with Row & Column Headers */}
              <div className="space-y-2 py-4">
                {/* Column Header Painter Row */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 text-center text-[9px] font-bold text-slate-600 uppercase">
                    Cols
                  </span>
                  <div className="flex items-center gap-1.5">
                    {cols.map((colNum) => (
                      <button
                        key={colNum}
                        onClick={() => paintEntireColumn(colNum)}
                        className="h-6 w-7 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-center"
                        title={`Click to paint entire Column ${colNum} with ${activeTool}`}
                      >
                        {colNum}
                      </button>
                    ))}
                  </div>
                  <span className="w-6 text-center text-[9px] font-bold text-slate-600 uppercase">
                    Cols
                  </span>
                </div>

                {/* Rows with Row Painter Headers */}
                {rows.map((row) => {
                  const rowSeats = currentLayout.seats
                    .filter((s) => s.row === row)
                    .sort((a, b) => a.col - b.col);

                  return (
                    <div key={row} className="flex items-center gap-2">
                      {/* Row Painter Header */}
                      <button
                        onClick={() => paintEntireRow(row)}
                        className="h-7 w-6 rounded bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-center"
                        title={`Click to paint entire Row ${row} with ${activeTool}`}
                      >
                        {row}
                      </button>

                      {/* Seat Columns */}
                      <div className="flex items-center gap-1.5">
                        {rowSeats.map((seat) => {
                          if (seat.type === "WALKWAY") {
                            return (
                              <div
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                className="h-7 w-7 rounded border border-dashed border-slate-800/40 bg-transparent flex items-center justify-center cursor-pointer hover:border-slate-700"
                                title="Aisle Gap"
                              />
                            );
                          }

                          const isBlocked = seat.status === "BLOCKED";
                          const isCustomerSelected = customerBookedIds.includes(
                            seat.id,
                          );
                          const cfg =
                            categoryConfig[seat.category] ||
                            categoryConfig.SILVER;
                          const matchesFilter =
                            filterCategory === "ALL" ||
                            seat.category === filterCategory;

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => handleSeatClick(seat)}
                              onMouseEnter={() => setHoveredSeat(seat)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              className={`relative flex h-7 w-7 items-center justify-center rounded-t-lg border text-[10px] font-mono font-semibold transition-all transform hover:scale-110 active:scale-95 shadow-xs cursor-pointer ${
                                !matchesFilter
                                  ? "opacity-25 scale-90 border-slate-800 bg-slate-900 text-slate-600"
                                  : isBlocked
                                    ? "border-rose-900 bg-rose-950/80 text-rose-500 cursor-not-allowed opacity-60"
                                    : mode === "PREVIEW" && isCustomerSelected
                                      ? "border-emerald-400 bg-emerald-500 text-white font-extrabold ring-2 ring-emerald-400 scale-110 shadow-lg shadow-emerald-500/30"
                                      : `${cfg.border} ${cfg.bg}`
                              }`}
                            >
                              {isBlocked ? (
                                <Lock className="h-3 w-3" />
                              ) : (
                                seat.col
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Row Painter Header */}
                      <button
                        onClick={() => paintEntireRow(row)}
                        className="h-7 w-6 rounded bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-center"
                        title={`Click to paint entire Row ${row} with ${activeTool}`}
                      >
                        {row}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-slate-900 pt-5 text-xs text-slate-400">
                {Object.entries(categoryConfig).map(([catKey, val]) => (
                  <div key={catKey} className="flex items-center gap-1.5">
                    <span
                      className={`h-3.5 w-3.5 rounded-t border ${val.border} ${val.bg}`}
                    />
                    <span>
                      {val.name} (৳{categoryPrices[catKey as SeatCategory]})
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-t border border-rose-900 bg-rose-950/80" />
                  <span>Blocked / VIP Locked</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Tool Palette & Category Price Configurator */}
            <div className="space-y-6">
              {/* Active Brush / Tool Palette */}
              {mode === "EDITOR" ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Paintbrush className="h-4 w-4 text-rose-500" /> Active
                      Paint Brush
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click single seats, row letters, or col headers to paint
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {(
                      [
                        "RECLINER",
                        "PLATINUM",
                        "GOLD",
                        "SILVER",
                        "ACCESSIBLE",
                        "BLOCKED",
                        "WALKWAY",
                      ] as const
                    ).map((tool) => {
                      const isSelected = activeTool === tool;
                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => setActiveTool(tool as any)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "border-rose-500 bg-rose-950/60 text-white shadow-sm"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  tool === "BLOCKED"
                                    ? "#f43f5e"
                                    : tool === "WALKWAY"
                                      ? "#475569"
                                      : categoryConfig[tool]?.color || "#fff",
                              }}
                            />
                            <span>
                              {tool === "BLOCKED"
                                ? "Lock / Block Seat"
                                : tool === "WALKWAY"
                                  ? "Walkway Aisle Gap"
                                  : categoryConfig[tool]?.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Eye className="h-4 w-4" /> Booking Simulation
                    </h3>
                    <p className="text-xs text-slate-400">
                      Select seats to simulate customer checkout
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Selected Seats:</span>
                      <span className="font-mono font-bold text-white">
                        {customerBookedIds.length} seats
                      </span>
                    </div>
                    <div className="border-t border-emerald-500/30 pt-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        Total Ticket Price:
                      </span>
                      <span className="font-mono font-extrabold text-emerald-400">
                        {formatCurrency(previewSelectedTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Housefull Revenue Metrics */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Auditorium Capacity & Yield
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Bookable Inventory:</span>
                    <span className="font-mono font-bold text-white">
                      {activeSeatsCount} seats
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Blocked / VIP Locked:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {blockedSeatsCount} seats
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      Max Yield Per Show:
                    </span>
                    <span className="font-mono font-extrabold text-emerald-400">
                      {formatCurrency(totalRevenuePotential)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hovered Seat Inspector */}
              {hoveredSeat && hoveredSeat.type !== "WALKWAY" && (
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs space-y-1 animate-in fade-in">
                  <div className="font-bold text-white">
                    Inspecting Seat {hoveredSeat.label}
                  </div>
                  <div className="text-slate-400">
                    Category:{" "}
                    <strong className="text-violet-300">
                      {hoveredSeat.category}
                    </strong>
                  </div>
                  <div className="text-slate-400">
                    Price Tier:{" "}
                    <strong className="text-emerald-400">
                      ৳{hoveredSeat.basePrice}
                    </strong>
                  </div>
                  <div className="text-slate-400">
                    Status:{" "}
                    <strong
                      className={
                        hoveredSeat.status === "AVAILABLE"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {hoveredSeat.status}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIER MATRIX & SURGE RULES */}
      {activeTab === "pricing" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Surge Multipliers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Base House Potential</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {formatCurrency(totalRevenuePotential)}
              </p>
              <p className="text-[11px] text-slate-400">
                Standard show gross capacity
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase">
                <span>Weekend Surge (1.2×)</span>
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400">
                {formatCurrency(weekendRevenuePotential)}
              </p>
              <p className="text-[11px] text-slate-400">
                Fri & Sat peak show potential
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase">
                <span>Eid / Holiday Surge (1.5×)</span>
                <Percent className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-400">
                {formatCurrency(holidayRevenuePotential)}
              </p>
              <p className="text-[11px] text-slate-400">
                Festival holiday gross potential
              </p>
            </div>
          </div>

          {/* Seat Category Price Configurator */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Category
                Price Tiers & Yield Configurator
              </h3>
              <p className="text-xs text-slate-400">
                Set base price per seat type. All seats assigned to a category
                will immediately inherit the price.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(categoryConfig) as SeatCategory[]).map((catKey) => {
                const cfg = categoryConfig[catKey];
                const count = currentLayout.seats.filter(
                  (s) => s.category === catKey && s.type !== "WALKWAY",
                ).length;
                const tierRev = count * categoryPrices[catKey];

                return (
                  <div
                    key={catKey}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{cfg.icon}</span> {cfg.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {count} seats
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold">
                        Price (৳):
                      </span>
                      <input
                        type="number"
                        value={categoryPrices[catKey]}
                        onChange={(e) =>
                          handleCategoryPriceChange(
                            catKey,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tier Potential:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(tierRev)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HALL ARCHITECTURE SPECS */}
      {activeTab === "geometry" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="h-4 w-4 text-rose-500" /> Hall Architecture &
              Acoustic Geometry
            </h3>
            <p className="text-xs text-slate-400">
              Projection arc, Dolby Atmos 64-channel spatial sound positioning,
              and gangway clearances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <span className="font-bold text-white uppercase block">
                Curved Screen Projection Arc
              </span>
              <p className="text-slate-400">
                IMAX Dual 4K Laser Projection with 15° Curved Arc Radius for
                immersive field-of-view.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <span className="font-bold text-white uppercase block">
                Dolby Atmos Audio Subsystem
              </span>
              <p className="text-slate-400">
                64-Channel Spatial Audio with Left, Right, Center, and Overhead
                Ceiling speaker arrays.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <span className="font-bold text-white uppercase block">
                Row Legroom Pitch
              </span>
              <p className="text-slate-400">
                1,200mm legroom pitch for Recliner Tiers; 950mm pitch for
                Standard Tiers.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <span className="font-bold text-white uppercase block">
                Emergency Gangways
              </span>
              <p className="text-slate-400">
                Center Gangway after Column 7 with illuminated LED tread
                indicators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JSON SCHEMA PAYLOAD */}
      {activeTab === "json" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="h-4 w-4 text-rose-500" /> JSON Layout
                Specification & API Payload
              </h3>
              <p className="text-xs text-slate-400">
                Exportable JSON geometry schema used by backend API endpoints.
              </p>
            </div>
            <button
              onClick={copyJSONPayload}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Copy className="h-3.5 w-3.5" />{" "}
              {jsonCopied ? "Copied!" : "Copy JSON"}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96">
            {exportSchemaJSON}
          </pre>
        </div>
      )}
    </div>
  );
};
