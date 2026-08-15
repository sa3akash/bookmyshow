"use client";

import React, { useState } from "react";
import { MapPin, Search, X, Check, Building, RefreshCw } from "lucide-react";
import { useLocationStore } from "@/stores/location.store";
import { useCitiesQuery } from "@/hooks/useClientQueries";

export function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, activeCity, setCity } = useLocationStore();
  const { data: citiesList = [], isLoading } = useCitiesQuery();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isLocationModalOpen) return null;

  const filteredCities = citiesList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularCities = citiesList.filter((c) => c.isPopular);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-[#0b0e17] p-6 shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Select Your Location</span>
                {isLoading && <RefreshCw className="h-3.5 w-3.5 text-rose-500 animate-spin" />}
              </h2>
              <p className="text-xs text-slate-400">
                Discover movies, cinema shows, and events near your city.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLocationModal}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city name (e.g. Dhaka, Chattogram...)"
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-medium"
          />
        </div>

        {/* Popular Cities Quick Grid */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-rose-500" /> Popular Cities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {popularCities.map((city) => {
              const isSelected = activeCity.id === city.id || activeCity.name === city.name;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setCity(city)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                    isSelected
                      ? "border-rose-500 bg-rose-500/10 text-white font-bold ring-1 ring-rose-500 shadow-lg shadow-rose-500/10"
                      : "border-slate-800/80 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{city.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{city.country}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-rose-500 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* All Cities List */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            All Cities ({filteredCities.length})
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredCities.map((city) => {
              const isSelected = activeCity.id === city.id || activeCity.name === city.name;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setCity(city)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span>{city.name}</span>
                  <span className="text-[10px] text-slate-500">{city.state || city.country}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
