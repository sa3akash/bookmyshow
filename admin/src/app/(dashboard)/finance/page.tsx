"use client";

import * as React from "react";
import { DollarSign, TrendingUp, Download, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Finance & P&L Overview</h1>
          <p className="text-xs text-muted-foreground">Gross Merchandise Value (GMV), platform fee collection, taxes, and merchant payouts.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Download className="h-4 w-4" /> Export P&L Ledger
        </Button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="py-4">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Gross Merchandise Value (GMV)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-black text-foreground">{formatCurrency(14850000)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="py-4">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Platform Fee Revenue (10%)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-black text-emerald-400">{formatCurrency(1485000)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="py-4">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold">Merchant Payouts (85%)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-black text-primary">{formatCurrency(12622500)}</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Statement Table (Rule 37) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">P&L Financial Statement</CardTitle>
          <CardDescription className="text-xs">Summary of gross earnings, deductions, taxes, and net platform profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground border-b border-border/80 uppercase font-semibold">
                <tr>
                  <th className="pb-3">Financial Line Item</th>
                  <th className="pb-3 text-right">Gross Amount</th>
                  <th className="pb-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                <tr>
                  <td className="py-3 font-bold text-foreground">Gross Ticket Sales (GMV)</td>
                  <td className="py-3 text-right font-bold text-foreground">{formatCurrency(14850000)}</td>
                  <td className="py-3 text-right text-muted-foreground">100.0%</td>
                </tr>
                <tr>
                  <td className="py-3 text-rose-400">Customer Discounts & Promo Codes</td>
                  <td className="py-3 text-right text-rose-400">-{formatCurrency(450000)}</td>
                  <td className="py-3 text-right text-muted-foreground">3.0%</td>
                </tr>
                <tr>
                  <td className="py-3 text-rose-400">Refunds & Disputed Reversals</td>
                  <td className="py-3 text-right text-rose-400">-{formatCurrency(125000)}</td>
                  <td className="py-3 text-right text-muted-foreground">0.8%</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-foreground">Net Ticket Revenue Collected</td>
                  <td className="py-3 text-right font-bold text-emerald-400">{formatCurrency(14275000)}</td>
                  <td className="py-3 text-right text-muted-foreground">96.1%</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Venue Cinema Merchant Share (85%)</td>
                  <td className="py-3 text-right text-muted-foreground">-{formatCurrency(12133750)}</td>
                  <td className="py-3 text-right text-muted-foreground">81.7%</td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">Government VAT & Tax (5%)</td>
                  <td className="py-3 text-right text-muted-foreground">-{formatCurrency(713750)}</td>
                  <td className="py-3 text-right text-muted-foreground">4.8%</td>
                </tr>
                <tr className="bg-primary/10 font-black text-sm">
                  <td className="py-3 text-primary">Net Platform Commission Income</td>
                  <td className="py-3 text-right text-primary">{formatCurrency(1427500)}</td>
                  <td className="py-3 text-right text-primary">9.6%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
