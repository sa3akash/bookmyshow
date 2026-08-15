"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  Star,
  Clock,
  Calendar,
  Ticket,
  Play,
  Film,
  Building2,
  RefreshCw,
} from "lucide-react";
import { useLocationStore } from "@/stores/location.store";
import { useMovieDetailsQuery, useMovieShowsQuery } from "@/hooks/useClientQueries";
import { ShowTimeGrid } from "@/components/cinema/ShowTimeGrid";
import { formatDateString } from "@/lib/utils";

interface MovieDetailsPageProps {
  params: Promise<{ movieId: string }>;
}

export default function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const { movieId } = use(params);
  const { activeCity } = useLocationStore();

  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const { data: movie, isLoading: isMovieLoading } = useMovieDetailsQuery(movieId);
  const { data: shows = [], isLoading: isShowsLoading } = useMovieShowsQuery(movieId, activeCity.id, selectedDate);

  if (isMovieLoading || !movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading movie details from server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Backdrop Hero Section */}
      <div className="relative w-full overflow-hidden bg-[#090c14] border-b border-slate-800/80">
        <div className="relative h-[360px] sm:h-[440px] w-full">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-[#06080e]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080e] via-[#06080e]/60 to-transparent" />
        </div>

        {/* Floating Details Banner */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Poster Card */}
            <div className="aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl">
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            </div>

            {/* Main Info */}
            <div className="space-y-3 max-w-3xl pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-0.5 text-[11px] font-black uppercase text-rose-400">
                  {movie.certificate}
                </span>
                <div className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating} ({movie.votesCount?.toLocaleString()} votes)</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {movie.durationMinutes} min • Released {formatDateString(movie.releaseDate)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="text-slate-400 font-bold">{movie.languages.join(", ")}</span>
                <span>•</span>
                <span className="text-slate-400">{movie.genres.join(", ")}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {movie.description}
              </p>

              {/* Formats Badges */}
              <div className="flex items-center gap-2 pt-2">
                {movie.formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-rose-400"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Date Selector & Showtime Finder */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-500" /> Select Showtime & Date
                {isShowsLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing cinemas in <strong className="text-rose-400">{activeCity.name}</strong>
              </p>
            </div>

            {/* Horizontal Date Picker Buttons */}
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
                    className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-rose-500 bg-rose-600 text-white font-black shadow-lg shadow-rose-600/30 ring-1 ring-rose-500 scale-105"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{dayName}</span>
                    <span className="text-base font-black font-mono">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtimes Grid */}
          <ShowTimeGrid shows={shows} />
        </div>

        {/* Cast & Crew Section */}
        {movie.cast && movie.cast.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-black text-white tracking-tight">Cast & Crew</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {movie.cast.map((actor) => (
                <div
                  key={actor.name}
                  className="flex flex-col items-center text-center p-3 rounded-2xl border border-slate-800/80 bg-slate-900/60"
                >
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-800 mb-2 border border-slate-700">
                    <img
                      src={actor.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                      alt={actor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1">{actor.name}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{actor.role}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
