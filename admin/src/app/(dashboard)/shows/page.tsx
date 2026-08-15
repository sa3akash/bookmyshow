"use client";

import * as React from "react";
import { Calendar, Plus, Clock, Edit, Trash2, CalendarDays, Layers, RefreshCw, X, Film, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";
import {
  useShowsQuery,
  useMoviesQuery,
  useScreensQuery,
  useCreateShowMutation,
  ShowRecord,
} from "@/hooks/useAdminQueries";

export default function ShowsPage() {
  const { data: showsList = [], isLoading, isFetching, refetch } = useShowsQuery();
  const { data: moviesList = [] } = useMoviesQuery();
  const { data: screensList = [] } = useScreensQuery();
  const createShowMutation = useCreateShowMutation();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedMovieId, setSelectedMovieId] = React.useState("");
  const [selectedScreenId, setSelectedScreenId] = React.useState("");
  const [showDate, setShowDate] = React.useState("2026-08-15");
  const [startTimeStr, setStartTimeStr] = React.useState("14:30");
  const [language, setLanguage] = React.useState("English");
  const [format, setFormat] = React.useState("IMAX 3D");
  const [basePriceBDT, setBasePriceBDT] = React.useState(550);

  React.useEffect(() => {
    if (moviesList.length > 0 && !selectedMovieId) {
      setSelectedMovieId(moviesList[0].id);
    }
  }, [moviesList, selectedMovieId]);

  React.useEffect(() => {
    if (screensList.length > 0 && !selectedScreenId) {
      setSelectedScreenId(screensList[0].id);
    }
  }, [screensList, selectedScreenId]);

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedScreenId) return;

    const startIso = new Date(`${showDate}T${startTimeStr}:00Z`).toISOString();
    // 2.5 hour default duration
    const endIso = new Date(new Date(startIso).getTime() + 150 * 60 * 1000).toISOString();

    await createShowMutation.mutateAsync({
      movieId: selectedMovieId,
      screenId: selectedScreenId,
      startTime: startIso,
      endTime: endIso,
      language,
      format,
      basePriceMinor: basePriceBDT * 100,
    });

    setShowAddModal(false);
    refetch();
  };

  const columns: ColumnDef<ShowRecord>[] = [
    {
      accessorKey: "movieTitle",
      header: "Movie & Format",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.movieTitle}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.language} • {row.original.format}</span>
        </div>
      ),
    },
    {
      accessorKey: "venueName",
      header: "Venue & Screen",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.original.venueName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.screenName}</span>
        </div>
      ),
    },
    {
      accessorKey: "showDate",
      header: "Showtime",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">{row.original.showDate}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" /> {row.original.startTime} - {row.original.endTime}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "basePriceBDT",
      header: "Base Price",
      cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.basePriceBDT)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "SELLING" ? "success" : st === "SOLD_OUT" ? "destructive" : st === "SCHEDULED" ? "info" : "outline"}
            className="text-[10px]"
          >
            {st}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Can permission="show:update">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Schedule Show Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Schedule New Movie Show</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateShow} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Target Movie</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  {moviesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Target Screen Hall</label>
                <select
                  value={selectedScreenId}
                  onChange={(e) => setSelectedScreenId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  {screensList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.venueName} - {s.screenName} ({s.screenType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Show Date</label>
                  <Input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Start Time</label>
                  <Input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Audio Language</label>
                  <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Tech Format</label>
                  <Input value={format} onChange={(e) => setFormat(e.target.value)} className="h-9 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Base Price (BDT)</label>
                <Input
                  type="number"
                  value={basePriceBDT}
                  onChange={(e) => setBasePriceBDT(parseFloat(e.target.value) || 550)}
                  className="h-9 text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createShowMutation.isPending} className="font-bold">
                  {createShowMutation.isPending ? "Scheduling..." : "Schedule Show"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 p-6 rounded-2xl border border-border/80 shadow-md backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Shows & Showtime Scheduling</h1>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> TanStack Syncing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage movie showtimes, screen assignments, pricing tiers, and real-time seat availability status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refetch
          </Button>
          <Can permission="show:create">
            <Button onClick={() => setShowAddModal(true)} size="sm" className="h-9 text-xs font-bold gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Schedule New Show
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={showsList}
        searchKey="movieTitle"
        searchPlaceholder="Search movie title or showtime..."
        isLoading={isLoading}
      />
    </div>
  );
}
