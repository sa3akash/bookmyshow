"use client";

import React from "react";
import { SeatLayoutEditor } from "@/components/seat-editor/SeatLayoutEditor";

export default function SeatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Visual Seat Layout Editor</h1>
        <p className="text-xs text-muted-foreground">
          Design screen seat grids, row lettering, categories (VIP, Recliner, Couple, Accessible), and pricing multipliers.
        </p>
      </div>

      <SeatLayoutEditor />
    </div>
  );
}
