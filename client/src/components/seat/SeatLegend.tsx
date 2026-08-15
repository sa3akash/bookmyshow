import React from "react";

export function SeatLegend() {
  const items = [
    { label: "Available", color: "bg-slate-900 border-slate-500 text-slate-300" },
    { label: "Selected", color: "bg-rose-600 border-white text-white shadow-rose-500/50" },
    { label: "Booked / Sold", color: "bg-slate-950 border-slate-800 text-slate-600" },
    { label: "Gold Tier", color: "bg-amber-950/80 border-amber-500 text-amber-300" },
    { label: "Platinum Tier", color: "bg-purple-950/80 border-purple-500 text-purple-300" },
    { label: "Recliner Suite", color: "bg-rose-950/80 border-rose-500 text-rose-300" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-800/80 bg-[#080b12] p-4 text-xs font-semibold text-slate-300">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`h-5 w-5 rounded-t-lg border border-b-2 flex items-center justify-center font-mono text-[9px] ${item.color}`}>
            💺
          </div>
          <span className="text-[11px] text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
