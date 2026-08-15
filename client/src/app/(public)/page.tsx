"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Building2,
  Tag,
  ChevronRight,
  Flame,
  RefreshCw,
} from "lucide-react";
import { useLocationStore } from "@/stores/location.store";
import { useMoviesQuery, useVenuesQuery } from "@/hooks/useClientQueries";
import { MOCK_COUPONS } from "@/lib/api/client";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieHeroBanner } from "@/components/movie/MovieHeroBanner";
import { CinemaCard } from "@/components/cinema/CinemaCard";

export default function HomePage() {
  const { activeCity } = useLocationStore();
  const [activeTab, setActiveTab] = useState<"NOW_SHOWING" | "COMING_SOON" | "TRENDING">("NOW_SHOWING");

  const { data: moviesList = [], isLoading: isMoviesLoading } = useMoviesQuery();
  const { data: venuesList = [], isLoading: isVenuesLoading } = useVenuesQuery(activeCity.id);

  const nowShowing = moviesList.filter((m) => m.status === "NOW_SHOWING");
  const comingSoon = moviesList.filter((m) => m.status === "COMING_SOON");
  const trending = moviesList.filter((m) => m.status === "TRENDING" || m.status === "NOW_SHOWING");

  const activeMovies =
    activeTab === "NOW_SHOWING" ? nowShowing : activeTab === "COMING_SOON" ? comingSoon : trending;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Hero Blockbuster Banner Carousel */}
      <MovieHeroBanner movies={moviesList} />

      {/* 2. Movie Discovery Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Recommended Movies</span>
                {isMoviesLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
              </h2>
              <p className="text-xs text-slate-400">
                Explore showtimes in <strong className="text-rose-400">{activeCity.name}</strong>
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("NOW_SHOWING")}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "NOW_SHOWING"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Now Showing ({nowShowing.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("COMING_SOON")}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "COMING_SOON"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Coming Soon ({comingSoon.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TRENDING")}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === "TRENDING"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Trending 🔥
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 3. Offers & Promos Banner Section */}
      <section className="rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
            <Tag className="h-4 w-4" /> Exclusive Booking Offers
          </div>
          <Link href="/offers" className="text-xs font-bold text-slate-300 hover:text-rose-400 flex items-center gap-1">
            View All Offers <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_COUPONS.map((coupon) => (
            <div
              key={coupon.code}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 hover:border-rose-500/50 transition-all"
            >
              <div className="flex items-center justify-between font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 w-fit">
                {coupon.code}
              </div>
              <p className="text-xs font-bold text-white">{coupon.description}</p>
              <p className="text-[10px] text-slate-500">Applicable on bKash, Nagad and credit cards</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Popular Cinemas Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Popular Cinemas</span>
                {isVenuesLoading && <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />}
              </h2>
              <p className="text-xs text-slate-400">
                Leading multiplex branches in <strong className="text-emerald-400">{activeCity.name}</strong>
              </p>
            </div>
          </div>

          <Link href="/cinemas" className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1">
            See All Cinemas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {venuesList.map((venue) => (
            <CinemaCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </div>
  );
}
