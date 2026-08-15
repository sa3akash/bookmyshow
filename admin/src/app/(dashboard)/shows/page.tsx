"use client";

import * as React from "react";
import { Calendar, Plus, Clock, Edit, Trash2, CalendarDays, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";

export interface ShowRecord {
  id: string;
  movieTitle: string;
  venueName: string;
  screenName: string;
  showDate: string;
  startTime: string;
  endTime: string;
  language: string;
  format: string;
  basePriceBDT: number;
  status: "SCHEDULED" | "SELLING" | "SOLD_OUT" | "CANCELLED";
}

const MOCK_SHOWS: ShowRecord[] = [
  { id: "shw-1001", movieTitle: "Avatar 3: Fire and Ash", venueName: "Star Cineplex - Bashundhara", screenName: "Hall 1 (IMAX)", showDate: "2026-08-15", startTime: "10:30 AM", endTime: "01:42 PM", language: "English", format: "IMAX 3D", basePriceBDT: 950, status: "SELLING" },
  { id: "shw-1002", movieTitle: "Avatar 3: Fire and Ash", venueName: "Star Cineplex - Bashundhara", screenName: "Hall 1 (IMAX)", showDate: "2026-08-15", startTime: "02:30 PM", endTime: "05:42 PM", language: "English", format: "IMAX 3D", basePriceBDT: 950, status: "SOLD_OUT" },
  { id: "shw-1003", movieTitle: "Priyotoma 2", venueName: "Blockbuster - Jamuna", screenName: "Cinema 1", showDate: "2026-08-15", startTime: "06:30 PM", endTime: "08:55 PM", language: "Bangla", format: "DOLBY ATMOS 2D", basePriceBDT: 450, status: "SELLING" },
  { id: "shw-1004", movieTitle: "Inception: Resurgence", venueName: "Silver Screen - Chattogram", screenName: "Screen A", showDate: "2026-08-15", startTime: "08:00 PM", endTime: "10:34 PM", language: "English", format: "REGULAR 2D", basePriceBDT: 400, status: "SELLING" },
];

export default function ShowsPage() {
  const columns: ColumnDef<ShowRecord>[] = [
    {
      accessorKey: "movieTitle",
      header: "Movie & Format",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.movieTitle}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.language} • {row.original.format}</span>
        </div>
      ),
    },
    {
      accessorKey: "venueName",
      header: "Venue & Screen",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.original.venueName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.screenName}</span>
        </div>
      ),
    },
    {
      accessorKey: "showDate",
      header: "Showtime",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">{row.original.showDate}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" /> {row.original.startTime} - {row.original.endTime}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "basePriceBDT",
      header: "Base Price",
      cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.basePriceBDT)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "SELLING" ? "success" : st === "SOLD_OUT" ? "destructive" : st === "SCHEDULED" ? "info" : "outline"}
            className="text-[10px]"
          >
            {st}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Can permission="show:update">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Show Schedules</h1>
          <p className="text-xs text-muted-foreground">Schedule showtimes, manage pricing tiers, and prevent scheduling conflicts.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/shows/calendar">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <CalendarDays className="h-4 w-4" /> Calendar View
            </Button>
          </a>
          <a href="/shows/bulk">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <Layers className="h-4 w-4" /> Bulk Generator
            </Button>
          </a>
          <Can permission="show:create">
            <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Schedule Show
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_SHOWS}
        searchKey="movieTitle"
        searchPlaceholder="Search movie or venue..."
        exportTitle="shows_schedule"
      />
    </div>
  );
}
