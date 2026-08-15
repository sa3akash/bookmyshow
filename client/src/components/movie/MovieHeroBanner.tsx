"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/types";

interface MovieHeroBannerProps {
  movies: Movie[];
}

export function MovieHeroBanner({ movies }: MovieHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const current = movies[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-[#090c14] shadow-2xl">
      {/* Backdrop Image with Dark Ambient Gradients */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden">
        <img
          src={current.bannerUrl || current.posterUrl}
          alt={current.title}
          className="h-full w-full object-cover object-center transition-all duration-700 scale-105"
        />

        {/* Ambient Gradients for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090c14] via-[#090c14]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090c14] via-[#090c14]/80 to-transparent" />
      </div>

      {/* Hero Banner Floating Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {/* Formats & Rating */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-black uppercase text-rose-400 backdrop-blur-md">
              FEATURED BLOCKBUSTER
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{current.rating} Rating</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {current.durationMinutes} min • {current.certificate}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            {current.title}
          </h1>

          {/* Description */}
          <p className="line-clamp-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {current.description}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/movies/${current.id}`}
              className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all active:scale-95"
            >
              <Ticket className="h-4 w-4" /> Book Now
            </Link>

            {current.trailerUrl && (
              <a
                href={current.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-xs font-bold text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition-all"
              >
                <Play className="h-4 w-4 text-rose-500 fill-rose-500" /> Trailer
              </a>
            )}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-2">
          {movies.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-rose-500" : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
