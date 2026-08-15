"use client";

import React, { useState, use } from "react";
import { Building2, MapPin, Calendar, RefreshCw } from "lucide-react";
import { useVenuesQuery, useMoviesQuery, useMovieShowsQuery } from "@/hooks/useClientQueries";
import { ShowTimeGrid } from "@/components/cinema/ShowTimeGrid";

interface CinemaDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default function CinemaDetailPage({ params }: CinemaDetailPageProps) {
  const { venueId } = use(params);

  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const { data: venuesList = [], isLoading: isVenueLoading } = useVenuesQuery();
  const { data: moviesList = [] } = useMoviesQuery();

  const venue = venuesList.find((v) => v.id === venueId) || venuesList[0];
  const targetMovieId = moviesList[0]?.id;

  const { data: showsList = [], isLoading: isShowsLoading } = useMovieShowsQuery(
    targetMovieId,
    venueId,
    selectedDate
  );

  const allShows = showsList.filter((s) => s.venueId === venue?.id || !s.venueId);

  if (isVenueLoading || !venue) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading cinema hall details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cinema Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{venue.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>{venue.address}</span>
            </p>
          </div>
        </div>

        {/* Facilities Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-200">
            {venue.totalScreens} Auditorium Screens
          </span>
          {venue.amenities.map((am: string) => (
            <span
              key={am}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-400"
            >
              {am}
            </span>
          ))}
        </div>
      </div>

      {/* Date Picker & Shows */}
      <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" /> Movie Showtimes
            {isShowsLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
          </h2>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {dates.map((dateStr) => {
              const isSelected = selectedDate === dateStr;
              const d = new Date(dateStr);
              const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = d.getDate();

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[60px] py-1.5 px-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-rose-500 bg-rose-600 text-white font-black shadow-md ring-1 ring-rose-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{dayName}</span>
                  <span className="text-sm font-black font-mono">{dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ShowTimeGrid shows={allShows} />
      </div>
    </div>
  );
}
