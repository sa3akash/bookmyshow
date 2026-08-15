"use client";

import React from "react";
import Link from "next/link";
import { Clock, Tv, Sparkles, AlertCircle } from "lucide-react";
import { Show } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ShowTimeGridProps {
  shows: Show[];
}

export function ShowTimeGrid({ shows }: ShowTimeGridProps) {
  if (!shows || shows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
        No showtimes available for the selected cinema and date.
      </div>
    );
  }

  // Group shows by venue and screen
  const groupedByVenue = new Map<string, { venueName: string; screens: Map<string, Show[]> }>();

  shows.forEach((show) => {
    const venueId = show.venueId || "v_default";
    const venueName = show.venueName || "Cinema Complex";
    const screenName = show.screenName || "Main Screen";

    if (!groupedByVenue.has(venueId)) {
      groupedByVenue.set(venueId, { venueName, screens: new Map() });
    }

    const venueObj = groupedByVenue.get(venueId)!;
    if (!venueObj.screens.has(screenName)) {
      venueObj.screens.set(screenName, []);
    }
    venueObj.screens.get(screenName)!.push(show);
  });

  return (
    <div className="space-y-6">
      {[...groupedByVenue.entries()].map(([venueId, venueData]) => (
        <div
          key={venueId}
          className="rounded-3xl border border-slate-800/90 bg-[#090c14] p-6 shadow-xl space-y-5"
        >
          {/* Venue Name Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                {venueData.venueName}
              </h3>
              <p className="text-[11px] text-slate-400">
                Dolby Atmos Audio • Laser 4K Projection System
              </p>
            </div>

            <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              {venueData.screens.size} Halls Available
            </span>
          </div>

          {/* Screens & Showtimes */}
          <div className="space-y-4">
            {[...venueData.screens.entries()].map(([screenName, screenShows]) => (
              <div key={screenName} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Tv className="h-3.5 w-3.5 text-rose-500" />
                  <span>{screenName}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {screenShows.map((show) => {
                    const isSoldOut = show.availability === "SOLD_OUT";
                    const isFastFilling = show.availability === "FAST_FILLING";
                    const isAlmostFull = show.availability === "ALMOST_FULL";

                    return (
                      <Link
                        key={show.id}
                        href={isSoldOut ? "#" : `/booking/${show.id}/seats`}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                          isSoldOut
                            ? "border-slate-800 bg-slate-950/60 opacity-40 cursor-not-allowed"
                            : isAlmostFull
                            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10 shadow-md"
                            : isFastFilling
                            ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500 hover:bg-rose-500/10 shadow-md"
                            : "border-slate-800 bg-slate-900/80 hover:border-rose-500/60 hover:bg-slate-800"
                        }`}
                      >
                        {/* Start Time */}
                        <span className="text-xs font-black text-white group-hover:text-rose-400 transition-colors">
                          {show.startTime}
                        </span>

                        {/* Format & Language */}
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {show.format} • {show.language}
                        </span>

                        {/* Price */}
                        <span className="text-[11px] font-bold text-emerald-400 mt-1 font-mono">
                          {formatCurrency(show.basePrice)}
                        </span>

                        {/* Availability Pill */}
                        <div className="mt-1.5">
                          {isSoldOut ? (
                            <span className="text-[9px] font-bold uppercase text-slate-500">
                              Sold Out
                            </span>
                          ) : isAlmostFull ? (
                            <span className="text-[9px] font-bold uppercase text-amber-400 animate-pulse">
                              Almost Full
                            </span>
                          ) : isFastFilling ? (
                            <span className="text-[9px] font-bold uppercase text-rose-400">
                              Filling Fast
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-emerald-400">
                              Available
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
