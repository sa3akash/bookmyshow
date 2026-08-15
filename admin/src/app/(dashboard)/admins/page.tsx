"use client";

import * as React from "react";
import { Shield, Plus, Lock, Key, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@/lib/auth/permissions";
import { Can } from "@/components/permissions/Can";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "DISABLED";
  mfaEnabled: boolean;
  lastLogin: string;
}

const MOCK_ADMINS: AdminUserRecord[] = [
  { id: "adm-1", name: "Shakil Ahmed", email: "admin@bookmyshow.com", role: "SUPER_ADMIN", status: "ACTIVE", mfaEnabled: true, lastLogin: "Just now" },
  { id: "adm-2", name: "Rafiqul Islam", email: "rafiq@bookmyshow.com", role: "MOVIE_MANAGER", status: "ACTIVE", mfaEnabled: true, lastLogin: "2 hours ago" },
  { id: "adm-3", name: "Sabrina Khan", email: "sabrina@bookmyshow.com", role: "FINANCE_MANAGER", status: "ACTIVE", mfaEnabled: true, lastLogin: "Yesterday" },
];

export default function AdminUsersPage() {
  const columns: ColumnDef<AdminUserRecord>[] = [
    {
      accessorKey: "name",
      header: "Admin User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Assigned Role",
      cell: ({ row }) => (
        <Badge variant="info" className="text-[10px] font-bold">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "mfaEnabled",
      header: "MFA Security",
      cell: ({ row }) => (
        <Badge variant={row.original.mfaEnabled ? "success" : "destructive"} className="text-[10px]">
          {row.original.mfaEnabled ? "MFA ENABLED" : "MFA DISABLED"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Active",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Admin Directory</h1>
          <p className="text-xs text-muted-foreground">Manage administrative credentials, MFA enforcement, and system roles.</p>
        </div>
        <Can permission="admin:create">
          <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
            <Plus className="h-4 w-4" /> Create Admin User
          </Button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_ADMINS}
        searchKey="name"
        searchPlaceholder="Search admin name..."
        exportTitle="admin_users"
      />
    </div>
  );
}
