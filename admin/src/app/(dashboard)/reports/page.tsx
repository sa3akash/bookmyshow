"use client";

import * as React from "react";
import { FileText, Download, Play, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const reports = [
    { name: "Daily Box Office Sales Report", type: "SALES", frequency: "Daily @ 11:59 PM", status: "SCHEDULED" },
    { name: "Weekly Venue Occupancy & Revenue", type: "OCCUPANCY", frequency: "Weekly Mondays", status: "SCHEDULED" },
    { name: "Monthly Merchant Settlement Report", type: "SETTLEMENT", frequency: "1st of Month", status: "SCHEDULED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Report Builder & Exports</h1>
          <p className="text-xs text-muted-foreground">Generate ad-hoc analytical reports and schedule automated exports.</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Play className="h-4 w-4" /> Run Custom Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">{r.name}</CardTitle>
                <Badge variant="success" className="text-[9px]">{r.status}</Badge>
              </div>
              <CardDescription className="text-xs">Frequency: {r.frequency}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 font-semibold">
                <Download className="h-3.5 w-3.5" /> Download Latest (CSV)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
