"use client";

import * as React from "react";
import { Ticket, Search, Filter, Eye, XCircle, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface BookingRecord {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  movieTitle: string;
  venueName: string;
  showTime: string;
  seats: string[];
  totalAmountBDT: number;
  paymentMethod: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "EXPIRED";
  createdAt: string;
}

const MOCK_BOOKINGS: BookingRecord[] = [
  { id: "b-1", bookingRef: "BK-88120", customerName: "Tanvir Rahman", customerPhone: "+8801711223344", movieTitle: "Avatar 3: Fire and Ash", venueName: "Star Cineplex - Bashundhara", showTime: "10:30 AM", seats: ["C4", "C5", "C6"], totalAmountBDT: 1350, paymentMethod: "BKASH", status: "CONFIRMED", createdAt: "2026-08-15T06:05:00Z" },
  { id: "b-2", bookingRef: "BK-88119", customerName: "Nusrat Jahan", customerPhone: "+8801811223344", movieTitle: "Inception: Resurgence", venueName: "Blockbuster - Jamuna", showTime: "02:30 PM", seats: ["B1", "B2"], totalAmountBDT: 900, paymentMethod: "NAGAD", status: "CONFIRMED", createdAt: "2026-08-15T05:50:00Z" },
  { id: "b-3", bookingRef: "BK-88118", customerName: "Ahmad Ali", customerPhone: "+8801911223344", movieTitle: "Priyotoma 2", venueName: "Silver Screen", showTime: "06:30 PM", seats: ["D8", "D9"], totalAmountBDT: 700, paymentMethod: "VISA", status: "PENDING", createdAt: "2026-08-15T05:40:00Z" },
  { id: "b-4", bookingRef: "BK-88117", customerName: "Farhana Islam", customerPhone: "+8801611223344", movieTitle: "Toofan", venueName: "Star Cineplex", showTime: "08:00 PM", seats: ["E12"], totalAmountBDT: 450, paymentMethod: "BKASH", status: "CANCELLED", createdAt: "2026-08-15T05:20:00Z" },
];

export default function BookingsPage() {
  const columns: ColumnDef<BookingRecord>[] = [
    {
      accessorKey: "bookingRef",
      header: "Booking Reference",
      cell: ({ row }) => (
        <a href={`/bookings/${row.original.id}`} className="font-bold text-primary hover:underline">
          {row.original.bookingRef}
        </a>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.original.customerName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.customerPhone}</span>
        </div>
      ),
    },
    {
      accessorKey: "movieTitle",
      header: "Movie & Show",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.movieTitle}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.venueName} • {row.original.showTime}</span>
        </div>
      ),
    },
    {
      accessorKey: "seats",
      header: "Seats",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.original.seats.join(", ")} ({row.original.seats.length})
        </span>
      ),
    },
    {
      accessorKey: "totalAmountBDT",
      header: "Amount Paid",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{formatCurrency(row.original.totalAmountBDT)}</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase">{row.original.paymentMethod}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "CONFIRMED" ? "success" : st === "PENDING" ? "warning" : "destructive"}
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
        <a href={`/bookings/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Eye className="h-3.5 w-3.5" /> Details
          </Button>
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Ticket Bookings</h1>
          <p className="text-xs text-muted-foreground">Monitor real-time customer bookings, tickets, and payment statuses.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_BOOKINGS}
        searchKey="bookingRef"
        searchPlaceholder="Search booking reference or customer..."
        exportTitle="bookings_master"
      />
    </div>
  );
}
