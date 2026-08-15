"use client";

import React from "react";

interface CityOption {
  id: string;
  name: string;
}

interface ScreenOption {
  id: string;
  name: string;
}

interface VenueOption {
  id: string;
  name: string;
  screens?: ScreenOption[];
}

interface AuditoriumSelectorProps {
  cities: CityOption[];
  venues: VenueOption[];
  screens: ScreenOption[];
  cityId: string;
  venueId: string;
  screenId: string;
  onCityChange: (id: string) => void;
  onVenueChange: (id: string) => void;
  onScreenChange: (id: string) => void;
}

export function AuditoriumSelector({
  cities,
  venues,
  screens,
  cityId,
  venueId,
  screenId,
  onCityChange,
  onVenueChange,
  onScreenChange,
}: AuditoriumSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
          City
        </label>
        <select
          value={cityId}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Venue / Cinema
        </label>
        <select
          value={venueId}
          onChange={(e) => onVenueChange(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Auditorium Screen
        </label>
        <select
          value={screenId}
          onChange={(e) => onScreenChange(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
        >
          {screens.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
