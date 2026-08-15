import React from "react";
import Link from "next/link";
import { Star, Ticket, Clock, Heart } from "lucide-react";
import { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-[#090c14] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-black text-amber-400 backdrop-blur-md border border-amber-500/30">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating}</span>
          </div>

          {movie.certificate && (
            <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-slate-300 backdrop-blur-md border border-slate-700">
              {movie.certificate}
            </span>
          )}
        </div>

        {/* Hover Quick Book Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/40 hover:bg-rose-500 transition-transform active:scale-95"
          >
            <Ticket className="h-4 w-4" /> Book Tickets
          </Link>
        </div>
      </div>

      {/* Movie Details Content */}
      <div className="flex flex-1 flex-col p-4 space-y-2">
        <Link href={`/movies/${movie.id}`} className="group-hover:text-rose-400 transition-colors">
          <h3 className="line-clamp-1 font-extrabold text-sm text-white tracking-tight">
            {movie.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
          <span>{movie.languages.join(", ")}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3 text-slate-500" /> {movie.durationMinutes}m
          </span>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-md border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-400"
            >
              {genre}
            </span>
          ))}
          {movie.formats.length > 0 && (
            <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
              {movie.formats[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
