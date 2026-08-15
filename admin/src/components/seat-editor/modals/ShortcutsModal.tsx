"use client";

import React from "react";
import { Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-purple-400" /> Studio Keyboard Shortcuts
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-300 font-mono">
          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 font-sans">Undo Action</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-purple-400 font-bold">Ctrl + Z</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 font-sans">Redo Action</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-purple-400 font-bold">Ctrl + Y / Ctrl+Shift+Z</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 font-sans">Select All Seats</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-purple-400 font-bold">Ctrl + A</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 font-sans">Delete Selected Seats</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-rose-400 font-bold">Delete / Backspace</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400 font-sans">Rotate Selected Seats (90°)</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">R</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-sans">Clear Selection</span>
            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">Escape</span>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
