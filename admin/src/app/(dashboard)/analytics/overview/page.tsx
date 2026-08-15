"use client";

import * as React from "react";
import { PieChart, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

const OCCUPANCY_BY_DAY = [
  { day: "Mon", rate: 68 },
  { day: "Tue", rate: 72 },
  { day: "Wed", rate: 70 },
  { day: "Thu", rate: 78 },
  { day: "Fri", rate: 92 },
  { day: "Sat", rate: 98 },
  { day: "Sun", rate: 94 },
];

const GENRE_SHARE = [
  { name: "Action", value: 45, color: "#3b82f6" },
  { name: "Sci-Fi", value: 25, color: "#10b981" },
  { name: "Romance", value: 15, color: "#f43f5e" },
  { name: "Drama", value: 15, color: "#8b5cf6" },
];

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Analytics Control Center</h1>
          <p className="text-xs text-muted-foreground">Deep data insights on box office performance, occupancy heatmaps, and customer trends.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Download className="h-4 w-4" /> Export Analytics CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Occupancy Rate (%)</CardTitle>
            <CardDescription className="text-xs">Average seat fill rate across all multiplexes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OCCUPANCY_BY_DAY}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", fontSize: "12px" }} />
                  <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Occupancy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Genre Share Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Box Office Revenue by Genre</CardTitle>
            <CardDescription className="text-xs">Genre distribution share of gross sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={GENRE_SHARE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {GENRE_SHARE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", fontSize: "12px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
