"use client";

import * as React from "react";
import { Users, Search, Shield, Ban, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";

export interface CustomerUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "DISABLED" | "SUSPENDED";
  verified: boolean;
  bookingsCount: number;
  totalSpentBDT: number;
  joinedAt: string;
}

const MOCK_CUSTOMERS: CustomerUserRecord[] = [
  { id: "usr-1", name: "Tanvir Rahman", email: "tanvir@example.com", phone: "+8801711223344", status: "ACTIVE", verified: true, bookingsCount: 12, totalSpentBDT: 14500, joinedAt: "2025-01-10" },
  { id: "usr-2", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+8801811223344", status: "ACTIVE", verified: true, bookingsCount: 8, totalSpentBDT: 9800, joinedAt: "2025-03-22" },
  { id: "usr-3", name: "Ahmad Ali", email: "ahmad@example.com", phone: "+8801911223344", status: "DISABLED", verified: false, bookingsCount: 1, totalSpentBDT: 700, joinedAt: "2026-02-14" },
];

export default function UsersPage() {
  const [usersList, setUsersList] = React.useState<CustomerUserRecord[]>(MOCK_CUSTOMERS);

  const toggleDisable = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE" } : u))
    );
  };

  const columns: ColumnDef<CustomerUserRecord>[] = [
    {
      accessorKey: "name",
      header: "Customer Name & Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email} • {row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "bookingsCount",
      header: "Bookings",
      cell: ({ row }) => <span className="font-bold text-foreground">{row.original.bookingsCount} Orders</span>,
    },
    {
      accessorKey: "totalSpentBDT",
      header: "Total Lifetime Value",
      cell: ({ row }) => <span className="font-bold text-emerald-400">{formatCurrency(row.original.totalSpentBDT)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "destructive"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Can permission="user:disable">
            <Button
              variant={u.status === "ACTIVE" ? "outline" : "default"}
              size="sm"
              onClick={() => toggleDisable(u.id)}
              className="h-7 text-xs font-semibold"
            >
              {u.status === "ACTIVE" ? "Disable" : "Enable"}
            </Button>
          </Can>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Customer Accounts</h1>
        <p className="text-xs text-muted-foreground">User registrations, verified identities, and booking histories.</p>
      </div>

      <DataTable
        columns={columns}
        data={usersList}
        searchKey="name"
        searchPlaceholder="Search customer name or email..."
        exportTitle="customer_users"
      />
    </div>
  );
}
