"use client";

import React, { useState } from "react";
import { Search, Film, Building2, RefreshCw } from "lucide-react";
import { useGlobalSearchQuery, useMoviesQuery, useVenuesQuery } from "@/hooks/useClientQueries";
import { MovieCard } from "@/components/movie/MovieCard";
import { CinemaCard } from "@/components/cinema/CinemaCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data: searchResults, isLoading: isSearchLoading } = useGlobalSearchQuery(query);
  const { data: allMovies = [] } = useMoviesQuery();
  const { data: allVenues = [] } = useVenuesQuery();

  const filteredMovies = query.trim()
    ? (searchResults?.movies || [])
    : allMovies;

  const filteredVenues = query.trim()
    ? (searchResults?.venues || [])
    : allVenues;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 shadow-2xl space-y-4">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Global Search</span>
          {isSearchLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Movies, Cinemas, Genres, Languages (e.g. Avatar, IMAX, Action)..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
          />
        </div>
      </div>

      {/* Movies Results */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Film className="h-5 w-5 text-rose-500" /> Matching Movies ({filteredMovies.length})
        </h2>
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No movies match your search.</p>
        )}
      </div>

      {/* Cinemas Results */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-500" /> Matching Cinemas ({filteredVenues.length})
        </h2>
        {filteredVenues.length > 0 ? (
          <div className="space-y-4">
            {filteredVenues.map((v) => (
              <CinemaCard key={v.id} venue={v} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No cinema venues match your search.</p>
        )}
      </div>
    </div>
  );
}
