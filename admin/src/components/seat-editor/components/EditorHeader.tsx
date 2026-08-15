"use client";

import React, { useRef } from "react";
import {
  Save,
  RotateCcw,
  RotateCw,
  Plus,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Wand2,
  Columns,
  Grid,
  Grid3X3,
  Download,
  Upload,
  Keyboard,
} from "lucide-react";
import { PageHeader } from "../../../components/shared/PageHeader";

interface EditorHeaderProps {
  mode: "EDITOR" | "PREVIEW";
  saving: boolean;
  isFetching: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeChange: (mode: "EDITOR" | "PREVIEW") => void;
  onUndo: () => void;
  onRedo: () => void;
  onShowBatchGrid: () => void;
  onShowPresets: () => void;
  onShowAisleModal: () => void;
  onAutoAlign: () => void;
  onShowAddRow: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowShortcuts: () => void;
  onRefetch: () => void;
  onSave: () => void;
}

export function EditorHeader({
  mode,
  saving,
  isFetching,
  canUndo,
  canRedo,
  onModeChange,
  onUndo,
  onRedo,
  onShowBatchGrid,
  onShowPresets,
  onShowAisleModal,
  onAutoAlign,
  onShowAddRow,
  onExportJson,
  onImportJson,
  onShowShortcuts,
  onRefetch,
  onSave,
}: EditorHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <PageHeader
      title="Seat Layout Designer"
      description="Dynamic, database-synchronized cinema auditorium seat & row layout builder."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onImportJson}
            className="hidden"
          />

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onModeChange("EDITOR")}
            className={`rounded-lg px-3 py-2 text-xs font-bold ${
              mode === "EDITOR"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            Designer
          </button>

          <button
            type="button"
            onClick={() => onModeChange("PREVIEW")}
            className={`rounded-lg px-3 py-2 text-xs font-bold ${
              mode === "PREVIEW"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            Customer Preview
          </button>

          <button
            type="button"
            onClick={onShowBatchGrid}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20"
            title="Batch generate auditorium seat grid (Rows, Seats, Aisles)"
          >
            <Grid3X3 className="h-3.5 w-3.5 text-blue-400" />
            Grid Builder
          </button>

          <button
            type="button"
            onClick={onShowPresets}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20"
            title="Apply pre-built cinema auditorium layout templates"
          >
            <Wand2 className="h-3.5 w-3.5 text-purple-400" />
            Presets
          </button>

          <button
            type="button"
            onClick={onShowAisleModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            title="Insert vertical aisle walkway at specific column"
          >
            <Columns className="h-3.5 w-3.5 text-amber-400" />
            Aisle Gap
          </button>

          <button
            type="button"
            onClick={onAutoAlign}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
            title="Auto-align seat positions in clean grid rows"
          >
            <Grid className="h-3.5 w-3.5 text-cyan-400" />
            Auto Align
          </button>

          <button
            type="button"
            onClick={onShowAddRow}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            title="Export layout JSON file"
          >
            <Download className="h-4 w-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            title="Import layout JSON file"
          >
            <Upload className="h-4 w-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={onShowShortcuts}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            title="View Keyboard Shortcuts"
          >
            <Keyboard className="h-4 w-4 text-purple-400" />
          </button>

          <button
            type="button"
            onClick={onRefetch}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            title="Reload layout from DB"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {saving ? "Syncing..." : "Sync DB"}
          </button>
        </div>
      }
    />
  );
}
