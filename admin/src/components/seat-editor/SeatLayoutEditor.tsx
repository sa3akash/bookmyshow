"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  CheckCircle,
  CheckSquare,
  Copy,
  DollarSign,
  FileCode,
  Filter,
  Layers,
  Paintbrush,
  Square,
  Trash2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { useTicketingStore } from "../../stores/ticketing.store";
import { useAuthStore } from "../../stores/auth.store";
import { can as checkPermission } from "../../lib/auth/permissions";
import type { SeatCategory, SeatItem } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { useCitiesQuery, useVenuesQuery } from "../../hooks/useAdminQueries";
import { apiClient } from "../../lib/api/client";
import { SeatCanvas } from "./components/SeatCanvas";
import { useSeatLayout } from "./hooks/useSeatLayout";
import {
  alignSeats,
  autoArrangeSeats,
  batchGenerateGrid,
  createRowSeats,
  extractDbSeats,
  generateAuditoriumTemplate,
  getLayoutBounds,
  getSeatRows,
  insertAisleAtColumn,
  normalizeDbSeat,
  prepareSavePayload,
  renameRow,
  rotateSelectedSeats,
  serializeSeatsForDb,
  setRowCategory,
  shiftRowPosition,
  validateSeatLayout,
  type DbSeat,
  type RenderSeat,
} from "./utils/seat-layout";

import { EditorHeader } from "./components/EditorHeader";
import { AuditoriumSelector } from "./components/AuditoriumSelector";
import { PainterControls, type Tool } from "./components/PainterControls";
import { RowOverviewSidebar } from "./components/RowOverviewSidebar";
import { AuditoriumSummary } from "./components/AuditoriumSummary";
import { PricingTab } from "./components/PricingTab";
import { JsonTab } from "./components/JsonTab";

import { AddRowModal } from "./modals/AddRowModal";
import { EditRowModal } from "./modals/EditRowModal";
import { AisleModal } from "./modals/AisleModal";
import { BatchGridModal } from "./modals/BatchGridModal";
import { TemplateModal } from "./modals/TemplateModal";
import { ShortcutsModal } from "./modals/ShortcutsModal";

const CATEGORY_CONFIG: Record<
  SeatCategory,
  { name: string; color: string; border: string; bg: string; icon: string }
> = {
  SILVER: {
    name: "Silver Tier",
    color: "#64748b",
    border: "border-slate-500",
    bg: "bg-slate-900 text-slate-300",
    icon: "💺",
  },
  GOLD: {
    name: "Gold Tier",
    color: "#f59e0b",
    border: "border-amber-500",
    bg: "bg-amber-950/80 text-amber-300",
    icon: "🌟",
  },
  PLATINUM: {
    name: "Platinum Tier",
    color: "#a855f7",
    border: "border-purple-500",
    bg: "bg-purple-950/80 text-purple-300",
    icon: "💎",
  },
  VIP: {
    name: "VIP Lounge",
    color: "#ec4899",
    border: "border-pink-500",
    bg: "bg-pink-950/80 text-pink-300",
    icon: "👑",
  },
  RECLINER: {
    name: "Royal Recliner",
    color: "#e11d48",
    border: "border-rose-500",
    bg: "bg-rose-950/80 text-rose-300",
    icon: "🛋️",
  },
  COUPLE: {
    name: "Couple Sofa",
    color: "#f43f5e",
    border: "border-rose-400",
    bg: "bg-rose-900/60 text-rose-200",
    icon: "💖",
  },
  ACCESSIBLE: {
    name: "Wheelchair",
    color: "#3b82f6",
    border: "border-blue-500",
    bg: "bg-blue-950/80 text-blue-300",
    icon: "♿",
  },
};

const PRICE_DEFAULTS: Record<SeatCategory, number> = {
  SILVER: 320,
  GOLD: 450,
  PLATINUM: 650,
  VIP: 950,
  RECLINER: 1200,
  COUPLE: 1400,
  ACCESSIBLE: 320,
};

export const SeatLayoutEditor: React.FC = () => {
  const { user } = useAuthStore();
  const canManageVenues = checkPermission(
    user?.role as any,
    "venue:create",
  );

  const { seatLayouts } = useTicketingStore();

  // Derived Auditorium Selector state (Zero useEffect cascades)
  const { data: cities = [] } = useCitiesQuery();
  const [selectedCityId, setSelectedCityId] = useState("");
  const activeCityId = selectedCityId || cities[0]?.id || "";

  const { data: venues = [] } = useVenuesQuery(activeCityId);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const activeVenueId =
    selectedVenueId && venues.some((v) => v.id === selectedVenueId)
      ? selectedVenueId
      : venues[0]?.id || "";
  const activeVenue = useMemo(
    () => venues.find((v) => v.id === activeVenueId) || venues[0],
    [venues, activeVenueId],
  );

  const screens = useMemo(() => activeVenue?.screens ?? [], [activeVenue]);
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const activeScreenId =
    selectedScreenId && screens.some((s: any) => s.id === selectedScreenId)
      ? selectedScreenId
      : screens[0]?.id || "";
  const activeScreen = useMemo(
    () => screens.find((s: any) => s.id === activeScreenId) || screens[0],
    [screens, activeScreenId],
  );

  // Editor mode & tools
  const [tool, setTool] = useState<Tool>("PLATINUM");
  const [filter, setFilter] = useState<SeatCategory | "ALL">("ALL");
  const [mode, setMode] = useState<"EDITOR" | "PREVIEW">("EDITOR");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"canvas" | "pricing" | "json">("canvas");
  const [prices, setPrices] = useState<Record<SeatCategory, number>>(PRICE_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Canvas scale & grid
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<RenderSeat[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals state
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowLabel, setNewRowLabel] = useState("H");
  const [newRowSeatsCount, setNewRowSeatsCount] = useState(10);
  const [newRowCategory, setNewRowCategory] = useState<SeatCategory>("SILVER");

  const [editingRowLabel, setEditingRowLabel] = useState<string | null>(null);
  const [editRowNameInput, setEditRowNameInput] = useState("");
  const [editRowCategoryInput, setEditRowCategoryInput] = useState<SeatCategory>("SILVER");

  const [showAisleModal, setShowAisleModal] = useState(false);
  const [aisleColumnNum, setAisleColumnNum] = useState(6);

  const [showBatchGridModal, setShowBatchGridModal] = useState(false);
  const [batchStartRow, setBatchStartRow] = useState("A");
  const [batchRowCount, setBatchRowCount] = useState(10);
  const [batchSeatsPerRow, setBatchSeatsPerRow] = useState(12);
  const [batchAislesText, setBatchAislesText] = useState("6");

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Interactive seats state
  const [editableSeats, setEditableSeats] = useState<RenderSeat[]>([]);
  const lastSyncedScreenIdRef = useRef<string | null>(null);

  const localLayout =
    seatLayouts.find((l) => l.id === seatLayouts[0]?.id) ?? seatLayouts[0];

  const {
    seats: initialSeats,
    isUsingDatabase,
    isLoading,
    isFetching,
    refetch,
  } = useSeatLayout({
    screenId: activeScreen?.id ?? activeScreenId,
    localSeats: localLayout?.seats ?? [],
    prices,
  });

  // Sync initialSeats into editableSeats ONLY when activeScreenId changes or first load
  useEffect(() => {
    if (activeScreenId && lastSyncedScreenIdRef.current !== activeScreenId) {
      if (initialSeats && initialSeats.length > 0) {
        setEditableSeats(initialSeats);
        setHistoryStack([initialSeats]);
        setHistoryIndex(0);
        lastSyncedScreenIdRef.current = activeScreenId;
      } else if (localLayout?.seats) {
        const fallback = localLayout.seats.map((s, idx) => ({
          ...s,
          x: 50 + (s.col - 1) * 36,
          y: 60 + idx * 4,
          width: 30,
          height: 30,
          rotation: 0,
          source: "LOCAL" as const,
        }));
        setEditableSeats(fallback);
        setHistoryStack([fallback]);
        setHistoryIndex(0);
        lastSyncedScreenIdRef.current = activeScreenId;
      }
    }
  }, [initialSeats, activeScreenId, localLayout]);

  // Derived layout calculations
  const rows = useMemo(() => getSeatRows(editableSeats), [editableSeats]);
  const bounds = useMemo(() => getLayoutBounds(editableSeats), [editableSeats]);

  const activeSeats = useMemo(
    () => editableSeats.filter((s) => s.type !== "WALKWAY" && s.status !== "BLOCKED"),
    [editableSeats],
  );

  const blockedSeats = useMemo(
    () => editableSeats.filter((s) => s.status === "BLOCKED"),
    [editableSeats],
  );

  const revenue = useMemo(() => {
    return activeSeats.reduce(
      (sum, seat) => sum + (prices[seat.category] ?? seat.basePrice ?? 350),
      0,
    );
  }, [activeSeats, prices]);

  const jsonPayload = useMemo(() => {
    const payload = prepareSavePayload(
      activeScreen?.id ?? activeScreenId,
      activeVenue?.id ?? activeVenueId,
      editableSeats,
      prices,
      activeScreen?.name,
    );
    return JSON.stringify(payload, null, 2);
  }, [activeScreen, activeScreenId, activeVenue, activeVenueId, editableSeats, prices]);

  // Push new state snapshot into history stack
  const updateSeatsWithHistory = useCallback((nextSeats: RenderSeat[]) => {
    setEditableSeats(nextSeats);
    setHistoryStack((stack) => {
      const sliced = stack.slice(0, historyIndex + 1);
      return [...sliced, nextSeats];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setEditableSeats(historyStack[prevIndex]);
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEditableSeats(historyStack[nextIndex]);
    }
  }, [historyIndex, historyStack]);

  // Selection & Painter handlers
  const handleSeatClick = (seat: RenderSeat) => {
    if (mode === "PREVIEW") {
      if (seat.status === "BLOCKED" || seat.type === "WALKWAY") return;
      setBooked((prev) => {
        const next = new Set(prev);
        if (next.has(seat.id)) next.delete(seat.id);
        else next.add(seat.id);
        return next;
      });
      return;
    }

    if (tool === "SELECT") {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(seat.id)) next.delete(seat.id);
        else next.add(seat.id);
        return next;
      });
      return;
    }

    // Apply Painter Tool
    const updated = editableSeats.map((s) => {
      if (s.id !== seat.id) return s;
      if (tool === "WALKWAY") {
        return { ...s, type: "WALKWAY" as const, label: "" };
      }
      if (tool === "BLOCK") {
        const nextStatus: SeatItem["status"] = s.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED";
        return { ...s, status: nextStatus };
      }
      const seatType: SeatItem["type"] = tool === "RECLINER" ? "RECLINER" : tool === "ACCESSIBLE" ? "WHEELCHAIR" : "STANDARD";
      return {
        ...s,
        category: tool as SeatCategory,
        type: seatType,
        basePrice: prices[tool as SeatCategory] ?? s.basePrice,
      };
    });

    updateSeatsWithHistory(updated);
  };

  const selectAllSeats = useCallback(() => {
    setSelected(new Set(editableSeats.map((s) => s.id)));
  }, [editableSeats]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const applyToolToSelected = () => {
    if (selected.size === 0) return;

    const updated = editableSeats.map((s) => {
      if (!selected.has(s.id)) return s;
      if (tool === "WALKWAY") {
        return { ...s, type: "WALKWAY" as const, label: "" };
      }
      if (tool === "BLOCK") {
        const blockStatus: SeatItem["status"] = "BLOCKED";
        return { ...s, status: blockStatus };
      }
      const seatType: SeatItem["type"] = tool === "RECLINER" ? "RECLINER" : tool === "ACCESSIBLE" ? "WHEELCHAIR" : "STANDARD";
      return {
        ...s,
        category: tool as SeatCategory,
        type: seatType,
        basePrice: prices[tool as SeatCategory] ?? s.basePrice,
      };
    });

    updateSeatsWithHistory(updated);
    setSelected(new Set());
  };

  const handleSelectMultipleSeats = useCallback(
    (seatIds: string[], append = false) => {
      setSelected((prev) => {
        const next = append ? new Set<string>(prev) : new Set<string>();
        seatIds.forEach((id) => next.add(id));
        return next;
      });
    },
    [],
  );

  const handleDeleteSelected = useCallback(() => {
    if (selected.size === 0) return;
    const updated = editableSeats.filter((s) => !selected.has(s.id));
    updateSeatsWithHistory(updated);
    setSelected(new Set());
  }, [selected, editableSeats, updateSeatsWithHistory]);

  const handleDeleteRow = (rowLabel: string) => {
    const updated = editableSeats.filter((s) => s.row !== rowLabel);
    updateSeatsWithHistory(updated);
  };

  const handleAddSeatToRow = (rowLabel: string) => {
    const rowSeats = editableSeats.filter((s) => s.row === rowLabel);
    const maxCol = rowSeats.length > 0 ? Math.max(...rowSeats.map((s) => s.col)) : 0;
    const nextCol = maxCol + 1;
    const rowY = rowSeats.length > 0 ? rowSeats[0].y : 60;
    const category = rowSeats.length > 0 ? rowSeats[0].category : "SILVER";
    const basePrice = prices[category] ?? 320;

    const newSeat: RenderSeat = {
      id: `new-seat-${rowLabel}-${nextCol}-${Date.now()}`,
      row: rowLabel,
      col: nextCol,
      label: `${rowLabel}${nextCol}`,
      category,
      basePrice,
      status: "AVAILABLE",
      type: "STANDARD",
      x: 50 + (nextCol - 1) * 36,
      y: rowY,
      width: 30,
      height: 30,
      rotation: 0,
      source: "LOCAL",
    };

    updateSeatsWithHistory([...editableSeats, newSeat]);
  };

  const handleAddRow = () => {
    const maxY = editableSeats.length > 0 ? Math.max(...editableSeats.map((s) => s.y)) : 40;
    const newSeats = createRowSeats(
      newRowLabel,
      newRowSeatsCount,
      newRowCategory,
      maxY + 48,
      prices[newRowCategory],
    );

    updateSeatsWithHistory([...editableSeats, ...newSeats]);
    setShowAddRowModal(false);

    const nextChar = String.fromCharCode(newRowLabel.charCodeAt(0) + 1);
    if (/^[A-Z]$/.test(nextChar)) setNewRowLabel(nextChar);
  };

  const handleOpenEditRow = (rowLabel: string) => {
    setEditingRowLabel(rowLabel);
    setEditRowNameInput(rowLabel);
    const rowSeats = editableSeats.filter((s) => s.row === rowLabel);
    if (rowSeats.length > 0) {
      setEditRowCategoryInput(rowSeats[0].category);
    }
  };

  const handleSaveEditRow = () => {
    if (!editingRowLabel) return;
    let updated = editableSeats;
    const targetName = editRowNameInput.trim().toUpperCase() || editingRowLabel;
    if (targetName !== editingRowLabel) {
      updated = renameRow(updated, editingRowLabel, targetName);
    }
    updated = setRowCategory(updated, targetName, editRowCategoryInput, prices[editRowCategoryInput]);
    updateSeatsWithHistory(updated);
    setEditingRowLabel(null);
  };

  const handleShiftRow = (rowLabel: string, deltaX: number, deltaY: number) => {
    const updated = shiftRowPosition(editableSeats, rowLabel, deltaX, deltaY);
    updateSeatsWithHistory(updated);
  };

  const handleInsertAisle = () => {
    const updated = insertAisleAtColumn(editableSeats, aisleColumnNum);
    updateSeatsWithHistory(updated);
    setShowAisleModal(false);
  };

  const handleRotateSelected = useCallback(() => {
    if (selected.size === 0) return;
    const updated = rotateSelectedSeats(editableSeats, selected, 90);
    updateSeatsWithHistory(updated);
  }, [selected, editableSeats, updateSeatsWithHistory]);

  const handleAlignSelected = (alignType: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "HORIZONTAL_CENTER" | "VERTICAL_CENTER") => {
    if (selected.size < 2) return;
    const updated = alignSeats(editableSeats, selected, alignType);
    updateSeatsWithHistory(updated);
  };

  const handleBatchGenerateGridSubmit = () => {
    const aisleCols = batchAislesText
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    const generated = batchGenerateGrid(
      batchStartRow,
      batchRowCount,
      batchSeatsPerRow,
      prices,
      aisleCols,
    );

    updateSeatsWithHistory(generated);
    setShowBatchGridModal(false);
  };

  const handleApplyTemplate = (type: "IMAX_CURVED" | "VIP_RECLINER" | "STANDARD_MULTIPLEX" | "BALCONY_AUDITORIUM") => {
    const tplSeats = generateAuditoriumTemplate(type, prices);
    updateSeatsWithHistory(tplSeats);
    setShowTemplateModal(false);
  };

  const handleAutoAlign = () => {
    const updated = autoArrangeSeats(editableSeats);
    updateSeatsWithHistory(updated);
  };

  const handleExportJson = () => {
    const filename = `seat-layout-${activeScreen?.name ? activeScreen.name.toLowerCase().replace(/\s+/g, "-") : "auditorium"}.json`;
    const blob = new Blob([jsonPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedSeats = extractDbSeats(parsed);
        if (importedSeats && importedSeats.length > 0) {
          const normalized = importedSeats.map((s: DbSeat) => normalizeDbSeat(s, prices));
          updateSeatsWithHistory(normalized);
          setSaveMessage("Successfully imported seat layout JSON file!");
          setTimeout(() => setSaveMessage(null), 3000);
        }
      } catch (err) {
        console.error("Import seat layout error:", err);
        setSaveMessage("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Keyboard Shortcuts Global Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) handleRedo();
        else handleUndo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        handleRedo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        selectAllSeats();
        e.preventDefault();
      } else if (e.key === "Escape") {
        clearSelection();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selected.size > 0) {
          handleDeleteSelected();
          e.preventDefault();
        }
      } else if (e.key.toLowerCase() === "r") {
        if (selected.size > 0) {
          handleRotateSelected();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selected, selectAllSeats, clearSelection, handleDeleteSelected, handleRotateSelected]);

  const handlePriceChange = (category: SeatCategory, newPrice: number) => {
    setPrices((prev) => ({ ...prev, [category]: newPrice }));
    const updated = editableSeats.map((s) => {
      if (s.category !== category) return s;
      return { ...s, basePrice: newPrice };
    });
    updateSeatsWithHistory(updated);
  };

  const handleUpdateSingleSeat = (seatId: string, updates: Partial<RenderSeat>) => {
    const updated = editableSeats.map((s) => (s.id === seatId ? { ...s, ...updates } : s));
    updateSeatsWithHistory(updated);
  };

  const handleDeleteSingleSeat = (seatId: string) => {
    const updated = editableSeats.filter((s) => s.id !== seatId);
    updateSeatsWithHistory(updated);
  };

  const save = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const serializedSeats = serializeSeatsForDb(editableSeats, prices);
      if (activeScreen?.id) {
        await apiClient.post(`/screens/${activeScreen.id}/seat-layout`, {
          venueId: activeVenue?.id,
          name: activeScreen?.name,
          totalSeats: activeSeats.length,
          seats: serializedSeats,
        });
      } else {
        await apiClient.post("/screens/layout", {
          venueId: activeVenue?.id,
          name: "Main Auditorium",
          totalSeats: activeSeats.length,
          seats: serializedSeats,
        });
      }

      await refetch();
      setSaveMessage("Seat layout successfully synchronized to database!");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      console.error("Save seat layout error:", err);
      setSaveMessage(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-slate-400">
        Loading seat layout…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <EditorHeader
        mode={mode}
        saving={saving}
        isFetching={isFetching}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onModeChange={setMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onShowBatchGrid={() => setShowBatchGridModal(true)}
        onShowPresets={() => setShowTemplateModal(true)}
        onShowAisleModal={() => setShowAisleModal(true)}
        onAutoAlign={handleAutoAlign}
        onShowAddRow={() => setShowAddRowModal(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onShowShortcuts={() => setShowShortcutsModal(true)}
        onRefetch={refetch}
        onSave={save}
      />

      {saveMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-bold ${
            saveMessage.includes("Failed")
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* Auditorium Selectors */}
      <AuditoriumSelector
        cities={cities}
        venues={venues}
        screens={screens}
        cityId={activeCityId}
        venueId={activeVenueId}
        screenId={activeScreenId}
        onCityChange={setSelectedCityId}
        onVenueChange={setSelectedVenueId}
        onScreenChange={setSelectedScreenId}
      />

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <button
          type="button"
          onClick={() => setTab("canvas")}
          className={`rounded-lg px-3 py-2 text-xs font-bold ${
            tab === "canvas" ? "bg-rose-600 text-white" : "text-slate-400"
          }`}
        >
          <Layers className="mr-1 inline h-3.5 w-3.5" />
          Interactive Canvas
        </button>

        <button
          type="button"
          onClick={() => setTab("pricing")}
          className={`rounded-lg px-3 py-2 text-xs font-bold ${
            tab === "pricing" ? "bg-rose-600 text-white" : "text-slate-400"
          }`}
        >
          <DollarSign className="mr-1 inline h-3.5 w-3.5" />
          Category Pricing
        </button>

        <button
          type="button"
          onClick={() => setTab("json")}
          className={`rounded-lg px-3 py-2 text-xs font-bold ${
            tab === "json" ? "bg-rose-600 text-white" : "text-slate-400"
          }`}
        >
          <FileCode className="mr-1 inline h-3.5 w-3.5" />
          DB Schema JSON
        </button>

        <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
          {isUsingDatabase ? "SYNCED WITH POSTGRES DB" : "LOCAL EDITOR ACTIVE"}
        </span>
      </div>

      {tab === "canvas" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            {/* Filter & Zoom Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-rose-500" />
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    filter === "ALL"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  All ({activeSeats.length})
                </button>

                {(Object.keys(CATEGORY_CONFIG) as SeatCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(cat)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      filter === cat
                        ? "border-rose-500 bg-slate-800 text-white"
                        : "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {CATEGORY_CONFIG[cat].icon} {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[40px] text-center font-mono text-[11px] font-bold text-rose-400">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid((g) => !g)}
                  className={`rounded p-1 ${showGrid ? "text-cyan-400 bg-slate-800" : "text-slate-500"}`}
                  title="Toggle Grid Lines"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Selection Toolbar */}
            {mode === "EDITOR" && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <span className="rounded-md bg-rose-500/20 px-2 py-0.5 font-mono font-bold text-rose-400">
                    {selected.size}
                  </span>
                  <span>Seats Selected</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllSeats}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Select All
                  </button>

                  {selected.size > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                      >
                        <Square className="h-3.5 w-3.5" />
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={handleRotateSelected}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                        title="Rotate selected seats 90 degrees (R)"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-purple-400" />
                        Rotate (90°)
                      </button>

                      {selected.size >= 2 && (
                        <div className="flex items-center gap-1 border-l border-r border-slate-700 px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleAlignSelected("LEFT")}
                            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Align Selected Seats Left"
                          >
                            <AlignLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignSelected("HORIZONTAL_CENTER")}
                            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Align Selected Seats Horizontal Center"
                          >
                            <AlignCenter className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignSelected("RIGHT")}
                            className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Align Selected Seats Right"
                          >
                            <AlignRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={applyToolToSelected}
                        className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500"
                      >
                        <Paintbrush className="h-3.5 w-3.5" />
                        Paint ({tool})
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete ({selected.size})
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <SeatCanvas
              seats={editableSeats}
              rows={rows}
              bounds={bounds}
              categoryConfig={CATEGORY_CONFIG}
              selectedIds={selected}
              customerSelectedIds={booked}
              filterCategory={filter}
              mode={mode}
              venueName={activeVenue?.name}
              screenName={activeScreen?.name}
              scale={scale}
              showGrid={showGrid}
              onSeatClick={handleSeatClick}
              onRowClick={handleOpenEditRow}
              onSelectMultipleSeats={handleSelectMultipleSeats}
              onUpdateSeat={handleUpdateSingleSeat}
              onDeleteSeat={handleDeleteSingleSeat}
            />
          </section>

          <aside className="space-y-4">
            {mode === "EDITOR" ? (
              <PainterControls
                tool={tool}
                onToolChange={setTool}
                categoryConfig={CATEGORY_CONFIG}
              />
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 text-sm font-bold text-white">
                  Customer Seating Simulator
                </div>
                <p className="text-xs text-slate-400">
                  Click seats on the canvas to simulate customer seat selection during booking.
                </p>
                <div className="mt-4 flex justify-between text-xs text-slate-300">
                  <span>Seats Chosen</span>
                  <strong className="font-mono text-emerald-400">{booked.size}</strong>
                </div>
                <div className="mt-2 flex justify-between border-t border-emerald-500/20 pt-2 text-xs">
                  <span>Total Amount</span>
                  <strong className="text-emerald-400">
                    {formatCurrency(
                      [...booked].reduce((sum, id) => {
                        const s = editableSeats.find((seat) => seat.id === id);
                        return sum + (s ? prices[s.category] ?? s.basePrice : 0);
                      }, 0),
                    )}
                  </strong>
                </div>
              </div>
            )}

            <RowOverviewSidebar
              rows={rows}
              categoryConfig={CATEGORY_CONFIG}
              onAddRowClick={() => setShowAddRowModal(true)}
              onOpenEditRow={handleOpenEditRow}
              onAddSeatToRow={handleAddSeatToRow}
              onDeleteRow={handleDeleteRow}
              onShiftRow={handleShiftRow}
            />

            <AuditoriumSummary
              totalItemsCount={editableSeats.length}
              activeRowsCount={rows.length}
              activeSeatsCount={activeSeats.length}
              blockedSeatsCount={blockedSeats.length}
              revenue={revenue}
            />
          </aside>
        </div>
      )}

      {tab === "pricing" && (
        <PricingTab
          prices={prices}
          editableSeats={editableSeats}
          categoryConfig={CATEGORY_CONFIG}
          onPriceChange={handlePriceChange}
        />
      )}

      {tab === "json" && <JsonTab jsonPayload={jsonPayload} />}

      {/* Modals */}
      <AddRowModal
        isOpen={showAddRowModal}
        rowLabel={newRowLabel}
        seatsCount={newRowSeatsCount}
        category={newRowCategory}
        prices={prices}
        categoryConfig={CATEGORY_CONFIG}
        onClose={() => setShowAddRowModal(false)}
        onRowLabelChange={setNewRowLabel}
        onSeatsCountChange={setNewRowSeatsCount}
        onCategoryChange={setNewRowCategory}
        onSubmit={handleAddRow}
      />

      <EditRowModal
        isOpen={editingRowLabel !== null}
        rowLabel={editingRowLabel}
        nameInput={editRowNameInput}
        categoryInput={editRowCategoryInput}
        prices={prices}
        categoryConfig={CATEGORY_CONFIG}
        onClose={() => setEditingRowLabel(null)}
        onNameInputChange={setEditRowNameInput}
        onCategoryInputChange={setEditRowCategoryInput}
        onShiftRow={handleShiftRow}
        onSave={handleSaveEditRow}
      />

      <AisleModal
        isOpen={showAisleModal}
        columnNum={aisleColumnNum}
        onClose={() => setShowAisleModal(false)}
        onColumnNumChange={setAisleColumnNum}
        onSubmit={handleInsertAisle}
      />

      <BatchGridModal
        isOpen={showBatchGridModal}
        startRow={batchStartRow}
        rowCount={batchRowCount}
        seatsPerRow={batchSeatsPerRow}
        aislesText={batchAislesText}
        onClose={() => setShowBatchGridModal(false)}
        onStartRowChange={setBatchStartRow}
        onRowCountChange={setBatchRowCount}
        onSeatsPerRowChange={setBatchSeatsPerRow}
        onAislesTextChange={setBatchAislesText}
        onSubmit={handleBatchGenerateGridSubmit}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
};
