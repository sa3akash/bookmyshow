"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  MapPin,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Can } from "@/components/permissions/Can";
import {
  useVenuesQuery,
  useCitiesQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
  VenueRecord,
} from "@/hooks/useAdminQueries";

export function VenuesClientView() {
  const { data: citiesList = [] } = useCitiesQuery();
  const [selectedCityId, setSelectedCityId] = React.useState<string>("");
  
  // Add Venue modal state
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newVenueName, setNewVenueName] = React.useState("");
  const [newVenueAddress, setNewVenueAddress] = React.useState("");

  // Edit Venue modal state
  const [editingVenue, setEditingVenue] = React.useState<VenueRecord | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Delete Venue modal state
  const [deletingVenue, setDeletingVenue] = React.useState<VenueRecord | null>(null);

  React.useEffect(() => {
    if (citiesList.length > 0 && (!selectedCityId || !citiesList.some((c) => c.id === selectedCityId))) {
      setSelectedCityId(citiesList[0].id);
    }
  }, [citiesList, selectedCityId]);

  const { data: venuesList = [], isLoading, isFetching, refetch } = useVenuesQuery(selectedCityId);
  const createVenueMutation = useCreateVenueMutation();
  const updateVenueMutation = useUpdateVenueMutation();
  const deleteVenueMutation = useDeleteVenueMutation();

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName || !newVenueAddress || !selectedCityId) return;

    await createVenueMutation.mutateAsync({
      cityId: selectedCityId,
      name: newVenueName,
      address: newVenueAddress,
    });

    setNewVenueName("");
    setNewVenueAddress("");
    setShowAddModal(false);
    refetch();
  };

  const handleOpenEdit = (venue: VenueRecord) => {
    setEditingVenue(venue);
    setEditName(venue.name);
    setEditAddress(venue.address);
    setEditStatus(venue.status === "ACTIVE" ? "ACTIVE" : "INACTIVE");
  };

  const handleUpdateVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue || !editName) return;

    await updateVenueMutation.mutateAsync({
      id: editingVenue.id,
      name: editName,
      address: editAddress,
      isActive: editStatus === "ACTIVE",
    });

    setEditingVenue(null);
    refetch();
  };

  const handleDeleteVenueSubmit = async () => {
    if (!deletingVenue) return;

    await deleteVenueMutation.mutateAsync(deletingVenue.id);
    setDeletingVenue(null);
    refetch();
  };

  const columns: ColumnDef<VenueRecord>[] = [
    {
      accessorKey: "name",
      header: "Venue Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-primary" /> {row.original.address}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City & Area",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.original.city}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.area}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalScreens",
      header: "Screens",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.original.totalScreens} Screens</span>,
    },
    {
      accessorKey: "totalCapacity",
      header: "Capacity",
      cell: ({ row }) => <span className="font-semibold text-foreground text-xs">{row.original.totalCapacity} Seats</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "ACTIVE" ? "success" : st === "MAINTENANCE" ? "warning" : "outline"}
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Can permission="venue:update">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(row.original)}
              className="h-7 px-2 text-xs font-bold gap-1 text-foreground border-border/80 hover:bg-accent"
              title="Edit Venue Details"
            >
              <Edit className="h-3.5 w-3.5 text-primary" /> Edit
            </Button>
          </Can>

          <Can permission="venue:delete">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeletingVenue(row.original)}
              className="h-7 px-2 text-xs font-bold gap-1"
              title="Delete Venue"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add Venue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Add New Venue Branch</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVenue} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Target City</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  {citiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Venue Branch Name</label>
                <Input
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="e.g. Star Cineplex - SKS Tower"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Street Address</label>
                <Input
                  required
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  placeholder="e.g. SKS Tower, Level 3, Mohakhali, Dhaka"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createVenueMutation.isPending} className="font-bold">
                  {createVenueMutation.isPending ? "Saving..." : "Create Venue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {editingVenue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-border/80 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Edit className="h-4 w-4 text-primary" /> Edit Venue Complex
              </h3>
              <button onClick={() => setEditingVenue(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateVenueSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Venue Name</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Address</label>
                <Input
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-background/60 px-3 text-xs font-semibold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingVenue(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updateVenueMutation.isPending} className="font-bold">
                  {updateVenueMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Venue Confirmation Modal */}
      {deletingVenue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl border border-destructive/40 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-destructive border-b border-border/60 pb-3">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">Confirm Venue Deletion</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deletingVenue.name}</strong> ({deletingVenue.city})? This action will deactivate the venue complex branch.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingVenue(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteVenueMutation.isPending}
                onClick={handleDeleteVenueSubmit}
                className="font-bold"
              >
                {deleteVenueMutation.isPending ? "Deleting..." : "Delete Venue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 p-6 rounded-2xl border border-border/80 shadow-md backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Venues & Cinema Complexes</h1>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> TanStack Syncing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage cinema branches, multiplex venues, hall screens, and seat layouts across Bangladesh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <div className="flex items-center gap-1.5 bg-background/60 border border-input rounded-lg px-2 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {citiesList.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refetch
          </Button>
          <Can permission="venue:create">
            <Button onClick={() => setShowAddModal(true)} size="sm" className="h-9 text-xs font-bold gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Add Venue Branch
            </Button>
          </Can>
        </div>
      </div>

      {/* Venues Table */}
      <DataTable columns={columns} data={venuesList} searchKey="name" searchPlaceholder="Search venue name or location..." isLoading={isLoading} />
    </div>
  );
}
