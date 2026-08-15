"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, RefreshCw, FileText } from "lucide-react";
import { useCustomerBookingsQuery } from "@/hooks/useClientQueries";
import { formatCurrency, formatDateString } from "@/lib/utils";
import { getTicketPassUrl, getMoneyReceiptUrl } from "@/lib/api/client";

export default function BookingsHistoryPage() {
  const [tab, setTab] = useState<"UPCOMING" | "COMPLETED" | "ALL">("UPCOMING");
  const { data: bookingsList = [], isLoading } = useCustomerBookingsQuery();

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredBookings = bookingsList.filter((b) => {
    if (tab === "UPCOMING") return b.showDate >= todayStr;
    if (tab === "COMPLETED") return b.showDate < todayStr;
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>My Movie Bookings</span>
              {isLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access digital QR tickets, view show details, or check your past order history.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab("UPCOMING")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
              tab === "UPCOMING" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab("COMPLETED")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
              tab === "COMPLETED" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Past Movies
          </button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.bookingId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800/90 bg-[#090c14] p-5 shadow-xl transition-all hover:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <img
                  src={b.moviePoster}
                  alt={b.movieTitle}
                  className="h-24 w-16 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    ID: {b.bookingId}
                  </span>
                  <h3 className="font-extrabold text-base text-white">{b.movieTitle}</h3>
                  <p className="text-xs text-slate-400">
                    {b.venueName} • {b.screenName}
                  </p>
                  <p className="text-xs text-rose-400 font-semibold">
                    {formatDateString(b.showDate)} • {b.startTime} ({b.format})
                  </p>
                  <p className="text-xs text-slate-300 font-mono">
                    Seats: <strong className="text-white">{b.seatLabels.join(", ")}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                <span className="font-mono font-black text-emerald-400 text-base">
                  {formatCurrency(b.totalAmount)}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <a
                    href={getTicketPassUrl(b.bookingId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-md flex items-center gap-1"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Pass (PDF)</span>
                  </a>

                  <a
                    href={getMoneyReceiptUrl(b.bookingId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-md flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Receipt (PDF)</span>
                  </a>

                  <Link
                    href={`/booking/${b.showId}/confirmation/${b.bookingId}`}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    View Ticket
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-2">
          <Ticket className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Bookings Found</h3>
          <p className="text-xs">Browse current showtimes and book your favorite movies online.</p>
        </div>
      )}
    </div>
  );
}
