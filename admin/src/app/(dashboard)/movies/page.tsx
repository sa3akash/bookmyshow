"use client";

import * as React from "react";
import { Plus, Film, Edit, Eye, Trash2, CheckCircle2, Archive, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";

export interface MovieRecord {
  id: string;
  poster: string;
  title: string;
  language: string;
  genres: string[];
  durationMinutes: number;
  releaseDate: string;
  rating: number;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED";
  showsCount: number;
  bookingsCount: number;
  revenueBDT: number;
}

const MOCK_MOVIES: MovieRecord[] = [
  { id: "m-101", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&auto=format&fit=crop&q=80", title: "Avatar 3: Fire and Ash", language: "English", genres: ["Sci-Fi", "Action"], durationMinutes: 192, releaseDate: "2026-12-18", rating: 9.2, status: "PUBLISHED", showsCount: 148, bookingsCount: 4200, revenueBDT: 1890000 },
  { id: "m-102", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80", title: "Inception: Resurgence", language: "English", genres: ["Action", "Thriller"], durationMinutes: 154, releaseDate: "2026-09-10", rating: 8.9, status: "PUBLISHED", showsCount: 112, bookingsCount: 3100, revenueBDT: 1395000 },
  { id: "m-103", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=100&auto=format&fit=crop&q=80", title: "Priyotoma 2", language: "Bangla", genres: ["Romance", "Drama"], durationMinutes: 145, releaseDate: "2026-06-15", rating: 8.7, status: "PUBLISHED", showsCount: 96, bookingsCount: 2800, revenueBDT: 980000 },
  { id: "m-104", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c7a5c1?w=100&auto=format&fit=crop&q=80", title: "Toofan", language: "Bangla", genres: ["Action", "Crime"], durationMinutes: 150, releaseDate: "2026-06-17", rating: 8.5, status: "PUBLISHED", showsCount: 88, bookingsCount: 2400, revenueBDT: 840000 },
  { id: "m-105", poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&auto=format&fit=crop&q=80", title: "Dune: Part Three", language: "English", genres: ["Sci-Fi", "Adventure"], durationMinutes: 165, releaseDate: "2026-11-20", rating: 9.4, status: "SCHEDULED", showsCount: 0, bookingsCount: 0, revenueBDT: 0 },
];

export default function MoviesManagementPage() {
  const [moviesList, setMoviesList] = React.useState<MovieRecord[]>(MOCK_MOVIES);

  const columns: ColumnDef<MovieRecord>[] = [
    {
      accessorKey: "title",
      header: "Movie & Poster",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-3">
            <img src={m.poster} alt={m.title} className="h-12 w-9 object-cover rounded-md border border-border/60 shadow-xs" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-xs">{m.title}</span>
              <span className="text-[10px] text-muted-foreground">{m.language} • {m.durationMinutes} mins</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "genres",
      header: "Genres",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genres.map((g) => (
            <Badge key={g} variant="outline" className="text-[9px] px-1.5 py-0">
              {g}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "releaseDate",
      header: "Release Date",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400" />
          <span>{row.original.rating}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "PUBLISHED" ? "success" : st === "SCHEDULED" ? "info" : "outline"}
            className="text-[10px]"
          >
            {st}
          </Badge>
        );
      },
    },
    {
      accessorKey: "revenueBDT",
      header: "Revenue Generated",
      cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.revenueBDT)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Can permission="movie:update">
              <a href={`/movies/new?edit=${m.id}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </a>
            </Can>
            <Can permission="movie:delete">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => setMoviesList((prev) => prev.filter((item) => item.id !== m.id))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Movies Catalog Management</h1>
          <p className="text-xs text-muted-foreground">Publish, edit, and monitor film inventory across all cinemas.</p>
        </div>
        <Can permission="movie:create">
          <a href="/movies/new">
            <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Add New Movie
            </Button>
          </a>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={moviesList}
        searchKey="title"
        searchPlaceholder="Search movie title..."
        exportTitle="movies_catalog"
      />
    </div>
  );
}
