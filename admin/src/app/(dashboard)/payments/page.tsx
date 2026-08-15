"use client";

import * as React from "react";
import { CreditCard, CheckCircle2, XCircle, RefreshCcw, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";

export interface TransactionRecord {
  id: string;
  transactionId: string;
  bookingRef: string;
  customerName: string;
  provider: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "STRIPE" | "RAZORPAY";
  method: "MOBILE_BANKING" | "CARD" | "NET_BANKING";
  amountBDT: number;
  status: "SUCCESS" | "FAILED" | "REFUNDED" | "PENDING";
  createdAt: string;
}

const MOCK_TRANSACTIONS: TransactionRecord[] = [
  { id: "tx-1", transactionId: "TXN-BK-998811", bookingRef: "BK-88120", customerName: "Tanvir Rahman", provider: "BKASH", method: "MOBILE_BANKING", amountBDT: 1325, status: "SUCCESS", createdAt: "2026-08-15T06:05:00Z" },
  { id: "tx-2", transactionId: "TXN-NG-774422", bookingRef: "BK-88119", customerName: "Nusrat Jahan", provider: "NAGAD", method: "MOBILE_BANKING", amountBDT: 900, status: "SUCCESS", createdAt: "2026-08-15T05:50:00Z" },
  { id: "tx-3", transactionId: "TXN-SSL-112233", bookingRef: "BK-88118", customerName: "Ahmad Ali", provider: "SSLCOMMERZ", method: "CARD", amountBDT: 700, status: "FAILED", createdAt: "2026-08-15T05:40:00Z" },
  { id: "tx-4", transactionId: "TXN-RF-556677", bookingRef: "BK-88110", customerName: "Farhana Islam", provider: "BKASH", method: "MOBILE_BANKING", amountBDT: 450, status: "REFUNDED", createdAt: "2026-08-15T04:20:00Z" },
];

export default function PaymentsDashboardPage() {
  const columns: ColumnDef<TransactionRecord>[] = [
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-foreground">{row.original.transactionId}</span>,
    },
    {
      accessorKey: "bookingRef",
      header: "Booking",
      cell: ({ row }) => (
        <a href={`/bookings/${row.original.bookingRef}`} className="font-bold text-primary hover:underline">
          {row.original.bookingRef}
        </a>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "provider",
      header: "Provider & Method",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-bold">
            {row.original.provider}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{row.original.method}</span>
        </div>
      ),
    },
    {
      accessorKey: "amountBDT",
      header: "Amount",
      cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.amountBDT)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === "SUCCESS" ? "success" : st === "FAILED" ? "destructive" : st === "REFUNDED" ? "warning" : "outline"}
            className="text-[10px]"
          >
            {st}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Payment Gateways & Transactions</h1>
        <p className="text-xs text-muted-foreground">Monitor payment provider success rates, failed attempts, and ledger transactions.</p>
      </div>

      {/* Payment Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-foreground">12,450</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Overall Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-emerald-500">98.4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">bKash Health</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-emerald-500">99.1% (Healthy)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">Nagad Health</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-black text-emerald-500">97.8% (Healthy)</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_TRANSACTIONS}
        searchKey="transactionId"
        searchPlaceholder="Search transaction ID..."
        exportTitle="payment_transactions"
      />
    </div>
  );
}
