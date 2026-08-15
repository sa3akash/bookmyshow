"use client";

import * as React from "react";
import { Megaphone, Plus, Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function CampaignsPage() {
  const campaigns = [
    { id: "cmp-1", name: "Avatar 3 IMAX Blockbuster Launch", targetCity: "Dhaka", couponCode: "AVATAR20", budgetBDT: 50000, revenueBDT: 1890000, roi: "3,680%", status: "RUNNING" },
    { id: "cmp-2", name: "Eid Movie Celebration Campaign", targetCity: "All Cities", couponCode: "EIDSPECIAL", budgetBDT: 100000, revenueBDT: 2450000, roi: "2,350%", status: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Marketing Campaigns</h1>
          <p className="text-xs text-muted-foreground">Targeted promotion campaigns, city targeting, and ROI tracking.</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Build Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">{c.name}</CardTitle>
                <CardDescription className="text-xs">Targeting {c.targetCity} • Code: {c.couponCode}</CardDescription>
              </div>
              <Badge variant={c.status === "RUNNING" ? "success" : "outline"} className="text-[10px]">
                {c.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Budget</span>
                  <span className="font-bold text-foreground">{formatCurrency(c.budgetBDT)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Revenue</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(c.revenueBDT)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">ROI</span>
                  <span className="font-black text-primary">{c.roi}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
