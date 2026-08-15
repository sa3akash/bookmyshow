"use client";

import * as React from "react";
import { Layers, Plus, Sliders, Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";

export interface ScreenRecord {
  id: string;
  venueName: string;
  screenName: string;
  screenType: "IMAX 3D" | "4DX" | "DOLBY ATMOS 2D" | "REGULAR 2D";
  capacity: number;
  soundSystem: string;
  projectionFormat: string;
  status: "ACTIVE" | "MAINTENANCE";
}

const MOCK_SCREENS: ScreenRecord[] = [
  { id: "scr-101", venueName: "Star Cineplex - Bashundhara", screenName: "Hall 1 (IMAX)", screenType: "IMAX 3D", capacity: 320, soundSystem: "Dolby Atmos 12.1", projectionFormat: "Laser 4K Dual", status: "ACTIVE" },
  { id: "scr-102", venueName: "Star Cineplex - Bashundhara", screenName: "Hall 2 (VIP)", screenType: "4DX", capacity: 180, soundSystem: "Dolby 7.1 Surround", projectionFormat: "Digital 4K", status: "ACTIVE" },
  { id: "scr-103", venueName: "Blockbuster - Jamuna", screenName: "Cinema 1 (Atmosphere)", screenType: "DOLBY ATMOS 2D", capacity: 280, soundSystem: "Dolby Atmos 64-Channel", projectionFormat: "Christie 4K Laser", status: "ACTIVE" },
  { id: "scr-104", venueName: "Silver Screen - Chattogram", screenName: "Screen A", screenType: "REGULAR 2D", capacity: 220, soundSystem: "Dolby Digital", projectionFormat: "Digital 2K", status: "ACTIVE" },
];

export default function ScreensPage() {
  const columns: ColumnDef<ScreenRecord>[] = [
    {
      accessorKey: "screenName",
      header: "Screen Name & Type",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.screenName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.venueName}</span>
        </div>
      ),
    },
    {
      accessorKey: "screenType",
      header: "Format",
      cell: ({ row }) => (
        <Badge variant="info" className="text-[10px] font-bold">
          {row.original.screenType}
        </Badge>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.original.capacity} Seats</span>,
    },
    {
      accessorKey: "soundSystem",
      header: "Sound & Projection",
      cell: ({ row }) => (
        <div className="flex flex-col text-[11px] text-muted-foreground">
          <span>{row.original.soundSystem}</span>
          <span className="text-[10px]">{row.original.projectionFormat}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "warning"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Seat Editor",
      cell: ({ row }) => (
        <a href="/seats">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
            <Sliders className="h-3 w-3 text-primary" /> Edit Layout
          </Button>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Screen Specifications</h1>
          <p className="text-xs text-muted-foreground">Configure projection tech, audio systems, and seat layouts.</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Add New Screen
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_SCREENS}
        searchKey="screenName"
        searchPlaceholder="Search screen name..."
        exportTitle="screens_specifications"
      />
    </div>
  );
}
