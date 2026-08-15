"use client";

import * as React from "react";
import { History, Shield, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  status: "SUCCESS" | "DENIED" | "FAILED";
}

const MOCK_AUDIT_LOGS: AuditLogRecord[] = [
  { id: "aud-1", timestamp: "2026-08-15T06:05:00Z", adminName: "Shakil Ahmed", adminEmail: "admin@bookmyshow.com", action: "movie:publish", resource: "Movie", resourceId: "m-101", ipAddress: "192.168.1.5", status: "SUCCESS" },
  { id: "aud-2", timestamp: "2026-08-15T05:25:00Z", adminName: "Sabrina Khan", adminEmail: "sabrina@bookmyshow.com", action: "payment:refund", resource: "Refund", resourceId: "RF-9901", ipAddress: "192.168.1.12", status: "SUCCESS" },
  { id: "aud-3", timestamp: "2026-08-15T04:10:00Z", adminName: "Rafiqul Islam", adminEmail: "rafiq@bookmyshow.com", action: "role:delete", resource: "Role", resourceId: "ROLE_TEMP", ipAddress: "192.168.1.8", status: "DENIED" },
];

export default function AuditLogsPage() {
  const columns: ColumnDef<AuditLogRecord>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => <span className="font-mono text-[11px] text-muted-foreground">{formatDate(row.original.timestamp, "MMM dd, p")}</span>,
    },
    {
      accessorKey: "adminName",
      header: "Admin User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">{row.original.adminName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.adminEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <Badge variant="outline" className="font-mono text-[10px]">{row.original.action}</Badge>,
    },
    {
      accessorKey: "resource",
      header: "Resource & Target ID",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{row.original.resource}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{row.original.resourceId}</span>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.ipAddress}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "SUCCESS" ? "success" : "destructive"} className="text-[10px]">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Audit Trail & Security Logs</h1>
        <p className="text-xs text-muted-foreground">Immutable audit record of administrative actions, data mutations, and security events.</p>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_AUDIT_LOGS}
        searchKey="adminName"
        searchPlaceholder="Search admin name..."
        exportTitle="audit_logs"
      />
    </div>
  );
}
