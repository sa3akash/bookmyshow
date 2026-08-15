"use client";

import React, { useState } from "react";
import { Film, Filter, Search, RefreshCw } from "lucide-react";
import { useMoviesQuery } from "@/hooks/useClientQueries";
import { MovieCard } from "@/components/movie/MovieCard";

export default function MoviesPage() {
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedFormat, setSelectedFormat] = useState("ALL");

  const { data: moviesList = [], isLoading } = useMoviesQuery({
    search,
    language: selectedLanguage,
    genre: selectedGenre,
    format: selectedFormat,
  });

  const languages = ["ALL", "English", "Hindi", "Bengali Dubbed"];
  const genres = ["ALL", "Action", "Sci-Fi", "Adventure", "Animation", "Biography", "Drama"];
  const formats = ["ALL", "IMAX 3D", "4DX", "DOLBY ATMOS 2D", "3D", "2D"];

  const filteredMovies = moviesList.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLanguage === "ALL" || m.languages.includes(selectedLanguage);
    const matchesGenre = selectedGenre === "ALL" || m.genres.includes(selectedGenre);
    const matchesFormat = selectedFormat === "ALL" || m.formats.includes(selectedFormat);

    return matchesSearch && matchesLang && matchesGenre && matchesFormat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>All Movies & Releases</span>
              {isLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse current blockbusters, upcoming premieres, and specialized IMAX/4DX film schedules.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie title..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-[#090c14] p-4 text-xs font-semibold text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[11px] mr-2">
          <Filter className="h-3.5 w-3.5" /> Filters
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-rose-500"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Genre:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-rose-500"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Format:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-rose-500"
          >
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-2">
          <Film className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Movies Match Your Criteria</h3>
          <p className="text-xs">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
