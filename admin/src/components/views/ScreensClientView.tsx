"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Sliders,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  Building2,
  Tv,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Can } from "@/components/permissions/Can";
import {
  useScreensQuery,
  useVenuesQuery,
  useCreateScreenMutation,
  useUpdateScreenMutation,
  useDeleteScreenMutation,
  ScreenRecord,
} from "@/hooks/useAdminQueries";

export function ScreensClientView() {
  const { data: screensList = [], isLoading, isFetching, refetch } = useScreensQuery();
  const { data: venuesList = [] } = useVenuesQuery();
  const createScreenMutation = useCreateScreenMutation();
  const updateScreenMutation = useUpdateScreenMutation();
  const deleteScreenMutation = useDeleteScreenMutation();

  // Add Screen modal state
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedVenueId, setSelectedVenueId] = React.useState("");
  const [screenName, setScreenName] = React.useState("");
  const [screenType, setScreenType] = React.useState("IMAX 3D");
  const [rowsCount, setRowsCount] = React.useState(8);
  const [seatsPerRow, setSeatsPerRow] = React.useState(14);

  // Edit Screen modal state
  const [editingScreen, setEditingScreen] = React.useState<ScreenRecord | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState("IMAX 3D");
  const [editStatus, setEditStatus] = React.useState<"ACTIVE" | "MAINTENANCE">("ACTIVE");

  // Delete Screen modal state
  const [deletingScreen, setDeletingScreen] = React.useState<ScreenRecord | null>(null);

  React.useEffect(() => {
    if (venuesList.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venuesList[0].id);
    }
  }, [venuesList, selectedVenueId]);

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenueId || !screenName) return;

    const rowLabels = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));
    const rows = rowLabels.map((label) => ({
      rowLabel: label,
      seatsCount: seatsPerRow,
    }));

    await createScreenMutation.mutateAsync({
      venueId: selectedVenueId,
      name: screenName,
      supportedFormats: [screenType],
      rows,
    });

    setScreenName("");
    setShowAddModal(false);
    refetch();
  };

  const handleOpenEdit = (screen: ScreenRecord) => {
    setEditingScreen(screen);
    setEditName(screen.screenName);
    setEditType(screen.screenType);
    setEditStatus(screen.status);
  };

  const handleUpdateScreenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreen || !editName) return;

    await updateScreenMutation.mutateAsync({
      id: editingScreen.id,
      name: editName,
      supportedFormats: [editType],
      isActive: editStatus === "ACTIVE",
    });

    setEditingScreen(null);
    refetch();
  };

  const handleDeleteScreenSubmit = async () => {
    if (!deletingScreen) return;

    await deleteScreenMutation.mutateAsync(deletingScreen.id);
    setDeletingScreen(null);
    refetch();
  };

  const columns: ColumnDef<ScreenRecord>[] = [
    {
      accessorKey: "screenName",
      header: "Screen Name & Venue",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.screenName}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3 text-primary" /> {row.original.venueName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "screenType",
      header: "Format",
      cell: ({ row }) => (
        <Badge variant="info" className="text-[10px] font-bold uppercase">
          {row.original.screenType}
        </Badge>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.original.capacity} Seats</span>,
    },
    {
      accessorKey: "soundSystem",
      header: "Sound & Projection",
      cell: ({ row }) => (
        <div className="flex flex-col text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 text-emerald-400" /> {row.original.soundSystem}
          </span>
          <span className="text-[10px]">{row.original.projectionFormat}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "warning"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Link href="/seats">
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 font-bold">
              <Sliders className="h-3 w-3 text-emerald-400" /> Layout
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEdit(row.original)}
            className="h-7 px-2 text-xs font-bold gap-1 text-foreground border-border/80 hover:bg-accent"
            title="Edit Screen Properties"
          >
            <Edit className="h-3.5 w-3.5 text-primary" /> Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeletingScreen(row.original)}
            className="h-7 px-2 text-xs font-bold gap-1"
            title="Delete Screen"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add Screen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Add New Auditorium Screen</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateScreen} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Target Venue Complex</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  {venuesList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Screen Name / Hall Designation</label>
                <Input
                  required
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g. Hall 1 (IMAX 3D Laser)"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Screen Tech Format</label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  <option value="IMAX 3D">IMAX 3D Laser</option>
                  <option value="4DX">4DX Motion Pods</option>
                  <option value="DOLBY ATMOS 2D">Dolby Atmos 2D</option>
                  <option value="VIP SUITE">VIP Recliner Suite</option>
                  <option value="REGULAR 2D">Regular 2D</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Rows Count</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={rowsCount}
                    onChange={(e) => setRowsCount(parseInt(e.target.value) || 8)}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Seats Per Row</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 14)}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground">
                Total Screen Capacity: <strong className="text-foreground">{rowsCount * seatsPerRow} Seats</strong> ({rowsCount} Rows × {seatsPerRow} Cols)
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createScreenMutation.isPending} className="font-bold">
                  {createScreenMutation.isPending ? "Generating..." : "Create Screen & Grid"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Screen Modal */}
      {editingScreen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Edit className="h-4 w-4 text-primary" /> Edit Screen Specification
              </h3>
              <button onClick={() => setEditingScreen(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateScreenSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Screen Name / Hall</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Screen Tech Format</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  <option value="IMAX 3D">IMAX 3D Laser</option>
                  <option value="4DX">4DX Motion Pods</option>
                  <option value="DOLBY ATMOS 2D">Dolby Atmos 2D</option>
                  <option value="VIP SUITE">VIP Recliner Suite</option>
                  <option value="REGULAR 2D">Regular 2D</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingScreen(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updateScreenMutation.isPending} className="font-bold">
                  {updateScreenMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Screen Confirmation Modal */}
      {deletingScreen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-destructive/40 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-destructive border-b border-border/60 pb-3">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">Confirm Screen Deletion</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deletingScreen.screenName}</strong> ({deletingScreen.venueName})? This action will mark the screen as inactive.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingScreen(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteScreenMutation.isPending}
                onClick={handleDeleteScreenSubmit}
                className="font-bold"
              >
                {deleteScreenMutation.isPending ? "Deleting..." : "Delete Screen"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 p-6 rounded-2xl border border-border/80 shadow-md backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Screen Specifications & Halls</h1>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> TanStack Syncing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure auditorium hall formats, Dolby Atmos audio arrays, 4K projection systems, and seat capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refetch
          </Button>
          <Can permission="screen:create">
            <Button onClick={() => setShowAddModal(true)} size="sm" className="h-9 text-xs font-bold gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Add New Screen
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={screensList}
        searchKey="screenName"
        searchPlaceholder="Search screen or venue..."
        isLoading={isLoading}
      />
    </div>
  );
}
