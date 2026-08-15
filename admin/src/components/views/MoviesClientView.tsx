"use client";

import * as React from "react";
import { Plus, Film, Edit, Eye, Trash2, CheckCircle2, Archive, Star, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";
import { useMoviesQuery, useCreateMovieMutation, MovieRecord } from "@/hooks/useAdminQueries";

export function MoviesClientView() {
  const { data: moviesList = [], isLoading, isFetching, refetch } = useMoviesQuery();
  const createMovieMutation = useCreateMovieMutation();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState(135);
  const [language, setLanguage] = React.useState("English");
  const [genre, setGenre] = React.useState("Action");
  const [releaseDate, setReleaseDate] = React.useState("2026-12-18");

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await createMovieMutation.mutateAsync({
      title,
      description,
      durationMinutes,
      languages: [language],
      genres: [genre],
      releaseDate,
    });

    setTitle("");
    setDescription("");
    setShowAddModal(false);
    refetch();
  };

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
      cell: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" title="View Details">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Can permission="movie:update">
            <Button variant="ghost" size="icon-xs" title="Edit Movie">
              <Edit className="h-3.5 w-3.5 text-primary" />
            </Button>
          </Can>
          <Can permission="movie:delete">
            <Button variant="ghost" size="icon-xs" title="Delete Movie" className="text-rose-400 hover:text-rose-300">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Add New Movie</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMovie} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Movie Title</label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Avatar 3: Fire and Ash" className="h-9 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Language</label>
                  <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Genre</label>
                  <Input value={genre} onChange={(e) => setGenre(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Duration (Mins)</label>
                  <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 120)} className="h-9 text-xs font-mono font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Release Date</label>
                  <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createMovieMutation.isPending} className="font-bold">
                  {createMovieMutation.isPending ? "Saving..." : "Add Movie"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 p-6 rounded-2xl border border-border/80 shadow-md backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Movie Catalog</h1>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> TanStack Syncing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage movie listings, ratings, genres, release dates, and box office analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refetch
          </Button>
          <Can permission="movie:create">
            <Button onClick={() => setShowAddModal(true)} size="sm" className="h-9 text-xs font-bold gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Add Movie
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={moviesList}
        searchKey="title"
        searchPlaceholder="Search movie title or language..."
        isLoading={isLoading}
      />
    </div>
  );
}
