"use client";

import React, { useState } from "react";
import { Building2, Search, MapPin, RefreshCw } from "lucide-react";
import { useLocationStore } from "@/stores/location.store";
import { useVenuesQuery } from "@/hooks/useClientQueries";
import { CinemaCard } from "@/components/cinema/CinemaCard";

export default function CinemasPage() {
  const { activeCity } = useLocationStore();
  const [search, setSearch] = useState("");

  const { data: venuesList = [], isLoading } = useVenuesQuery(activeCity.id);

  const filteredVenues = venuesList.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.address.toLowerCase().includes(search.toLowerCase()) ||
      v.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Cinemas & Multiplexes in {activeCity.name}</span>
              {isLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover screen halls, IMAX laser projection, 4DX motion seats, and venue facilities.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cinema branch or location..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => <CinemaCard key={venue.id} venue={venue} />)
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
            No cinemas found in {activeCity.name}. Try switching your location in the top bar.
          </div>
        )}
      </div>
    </div>
  );
}
