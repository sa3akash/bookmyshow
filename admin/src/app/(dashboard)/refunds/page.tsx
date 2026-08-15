"use client";

import * as React from "react";
import { DollarSign, CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";

export interface RefundRecord {
  id: string;
  refundRef: string;
  bookingRef: string;
  customerName: string;
  amountBDT: number;
  reason: string;
  status: "PENDING_APPROVAL" | "PROCESSING" | "COMPLETED" | "FAILED";
  requestedBy: string;
  requestedAt: string;
}

const MOCK_REFUNDS: RefundRecord[] = [
  { id: "rf-1", refundRef: "RF-9901", bookingRef: "BK-88117", customerName: "Farhana Islam", amountBDT: 450, reason: "Customer requested show cancellation", status: "PENDING_APPROVAL", requestedBy: "Customer Support", requestedAt: "2026-08-15T05:25:00Z" },
  { id: "rf-2", refundRef: "RF-9900", bookingRef: "BK-88105", customerName: "Karim Uddin", amountBDT: 1350, reason: "Show cancelled due to technical hall issue", status: "COMPLETED", requestedBy: "System Automated", requestedAt: "2026-08-14T14:10:00Z" },
];

export default function RefundsPage() {
  const [refundsList, setRefundsList] = React.useState<RefundRecord[]>(MOCK_REFUNDS);

  const handleApprove = (id: string) => {
    setRefundsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r))
    );
  };

  const columns: ColumnDef<RefundRecord>[] = [
    {
      accessorKey: "refundRef",
      header: "Refund ID",
      cell: ({ row }) => <span className="font-mono font-bold text-xs text-foreground">{row.original.refundRef}</span>,
    },
    {
      accessorKey: "bookingRef",
      header: "Booking",
      cell: ({ row }) => <span className="font-bold text-primary">{row.original.bookingRef}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "amountBDT",
      header: "Refund Amount",
      cell: ({ row }) => <span className="font-bold text-emerald-400">{formatCurrency(row.original.amountBDT)}</span>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{row.original.reason}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "COMPLETED" ? "success" : st === "PENDING_APPROVAL" ? "warning" : "destructive"}
            className="text-[10px]"
          >
            {st}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Workflow Actions",
      cell: ({ row }) => {
        const r = row.original;
        if (r.status === "PENDING_APPROVAL") {
          return (
            <Can permission="payment:refund">
              <Button size="sm" onClick={() => handleApprove(r.id)} className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 font-bold">
                Approve & Refund
              </Button>
            </Can>
          );
        }
        return <span className="text-[10px] text-muted-foreground">Settled</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Refunds & Disputations</h1>
        <p className="text-xs text-muted-foreground">Approval workflows for customer refunds and wallet disbursements.</p>
      </div>

      <DataTable
        columns={columns}
        data={refundsList}
        searchKey="refundRef"
        searchPlaceholder="Search refund ID..."
        exportTitle="refunds_ledger"
      />
    </div>
  );
}
