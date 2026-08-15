"use client";

import * as React from "react";
import { Building2, Plus, MapPin, Phone, Layers, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Can } from "@/components/permissions/Can";

export interface VenueRecord {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  contactPhone: string;
  totalScreens: number;
  totalCapacity: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

const MOCK_VENUES: VenueRecord[] = [
  { id: "v-1", name: "Star Cineplex - Bashundhara City", city: "Dhaka", area: "Panthapath", address: "Level 8, Bashundhara City Shopping Mall", contactPhone: "+880 1711 000111", totalScreens: 8, totalCapacity: 1850, status: "ACTIVE" },
  { id: "v-2", name: "Blockbuster Cinemas - Jamuna Future Park", city: "Dhaka", area: "Kuril", address: "Level 5, Jamuna Future Park", contactPhone: "+880 1722 000222", totalScreens: 7, totalCapacity: 1600, status: "ACTIVE" },
  { id: "v-3", name: "Star Cineplex - SKS Tower", city: "Dhaka", area: "Mohakhali", address: "SKS Tower, Mohakhali", contactPhone: "+880 1733 000333", totalScreens: 4, totalCapacity: 920, status: "ACTIVE" },
  { id: "v-4", name: "Silver Screen - Chattogram", city: "Chattogram", area: "Sholashahar", address: "Finlay Square, Sholashahar", contactPhone: "+880 1744 000444", totalScreens: 3, totalCapacity: 650, status: "ACTIVE" },
];

export default function VenuesPage() {
  const [venuesList, setVenuesList] = React.useState<VenueRecord[]>(MOCK_VENUES);

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
      header: "Total Capacity",
      cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.totalCapacity} Seats</span>,
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
          <Can permission="venue:update">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Can>
          <Can permission="venue:delete">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => setVenuesList((prev) => prev.filter((v) => v.id !== row.original.id))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Venues & Theaters</h1>
          <p className="text-xs text-muted-foreground">Manage cinema locations, addresses, and screen capabilities.</p>
        </div>
        <Can permission="venue:create">
          <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
            <Plus className="h-4 w-4" /> Add New Venue
          </Button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={venuesList}
        searchKey="name"
        searchPlaceholder="Search venue name..."
        exportTitle="venues_list"
      />
    </div>
  );
}
