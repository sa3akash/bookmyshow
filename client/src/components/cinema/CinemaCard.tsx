import React from "react";
import Link from "next/link";
import { Building2, MapPin, Tv, ShieldCheck } from "lucide-react";
import { Venue } from "@/types";

interface CinemaCardProps {
  venue: Venue;
}

export function CinemaCard({ venue }: CinemaCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/90 bg-[#090c14] p-5 shadow-xl transition-all hover:border-slate-700">
      <div className="space-y-2 max-w-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className="font-extrabold text-base text-white tracking-tight">{venue.name}</h3>
        </div>

        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span>{venue.address}</span>
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-300">
            {venue.totalScreens} Screens
          </span>
          {venue.amenities.map((am) => (
            <span
              key={am}
              className="rounded-md border border-slate-800/80 bg-slate-950 px-2 py-0.5 text-[10px] font-medium text-slate-400"
            >
              {am}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/cinemas/${venue.id}`}
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-md"
        >
          View Showtimes
        </Link>
      </div>
    </div>
  );
}
