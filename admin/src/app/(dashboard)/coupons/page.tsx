"use client";

import * as React from "react";
import { Tag, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";

export interface CouponRecord {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderBDT: number;
  usageCount: number;
  usageLimit: number;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
}

const MOCK_COUPONS: CouponRecord[] = [
  { id: "c-1", code: "PROMO100", type: "FIXED_AMOUNT", discountValue: 100, minOrderBDT: 500, usageCount: 450, usageLimit: 1000, expiryDate: "2026-12-31", status: "ACTIVE" },
  { id: "c-[2]", code: "AVATAR20", type: "PERCENTAGE", discountValue: 20, minOrderBDT: 800, usageCount: 890, usageLimit: 1000, expiryDate: "2026-09-30", status: "ACTIVE" },
  { id: "c-3", code: "EIDSPECIAL", type: "FIXED_AMOUNT", discountValue: 250, minOrderBDT: 1000, usageCount: 500, usageLimit: 500, expiryDate: "2026-07-01", status: "EXPIRED" },
];

export default function CouponsPage() {
  const columns: ColumnDef<CouponRecord>[] = [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => <span className="font-mono font-bold text-xs text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "type",
      header: "Discount Type & Value",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">
            {row.original.type === "PERCENTAGE" ? `${row.original.discountValue}% OFF` : `৳${row.original.discountValue} OFF`}
          </span>
          <span className="text-[10px] text-muted-foreground">Min order: ৳{row.original.minOrderBDT}</span>
        </div>
      ),
    },
    {
      accessorKey: "usageCount",
      header: "Redemption Limit",
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-foreground">
          {row.original.usageCount} / {row.original.usageLimit}
        </span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expires On",
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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Coupon & Promo Codes</h1>
          <p className="text-xs text-muted-foreground">Create discount codes, order thresholds, and movie restrictions.</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_COUPONS}
        searchKey="code"
        searchPlaceholder="Search coupon code..."
        exportTitle="coupons_list"
      />
    </div>
  );
}
