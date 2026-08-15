"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ticket,
  Users,
  Film,
  Building2,
  Activity,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { useDashboardStatsQuery } from "@/hooks/useAdminQueries";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const REVENUE_DATA = [
  { date: "Mon", gross: 450000, net: 410000, refunds: 15000 },
  { date: "Tue", gross: 520000, net: 480000, refunds: 12000 },
  { date: "Wed", gross: 480000, net: 440000, refunds: 18000 },
  { date: "Thu", gross: 610000, net: 570000, refunds: 20000 },
  { date: "Fri", gross: 890000, net: 830000, refunds: 25000 },
  { date: "Sat", gross: 1250000, net: 1180000, refunds: 30000 },
  { date: "Sun", gross: 1100000, net: 1040000, refunds: 22000 },
];

const TOP_MOVIES = [
  { rank: 1, title: "Avatar 3: Fire and Ash", language: "English", bookings: 4200, revenue: 1890000, occupancy: 96.5, rating: 9.2 },
  { rank: 2, title: "Inception: Resurgence", language: "English", bookings: 3100, revenue: 1395000, occupancy: 88.0, rating: 8.9 },
  { rank: 3, title: "Priyotoma 2", language: "Bangla", bookings: 2800, revenue: 980000, occupancy: 84.5, rating: 8.7 },
  { rank: 4, title: "Toofan", language: "Bangla", bookings: 2400, revenue: 840000, occupancy: 81.2, rating: 8.5 },
];

const TOP_VENUES = [
  { rank: 1, name: "Star Cineplex - Bashundhara City", city: "Dhaka", shows: 48, tickets: 3820, occupancy: 92.4, revenue: 1719000 },
  { rank: 2, name: "Blockbuster Cinemas - Jamuna Future Park", city: "Dhaka", shows: 42, tickets: 3150, occupancy: 86.5, revenue: 1417500 },
  { rank: 3, name: "Star Cineplex - SKS Tower Mohakhali", city: "Dhaka", shows: 36, tickets: 2700, occupancy: 88.2, revenue: 1215000 },
  { rank: 4, name: "Silver Screen - Chattogram", city: "Chattogram", shows: 24, tickets: 1800, occupancy: 81.0, revenue: 720000 },
];

const RECENT_BOOKINGS = [
  { id: "BK-88120", customer: "Tanvir Rahman", movie: "Avatar 3", venue: "Star Cineplex", amount: 1350, seats: "C4, C5, C6", status: "CONFIRMED", time: "2 mins ago" },
  { id: "BK-88119", customer: "Nusrat Jahan", movie: "Inception: Resurgence", venue: "Blockbuster", amount: 900, seats: "B1, B2", status: "CONFIRMED", time: "5 mins ago" },
  { id: "BK-88118", customer: "Ahmad Ali", movie: "Priyotoma 2", venue: "Silver Screen", amount: 700, seats: "D8, D9", status: "PENDING", time: "12 mins ago" },
  { id: "BK-88117", customer: "Farhana Islam", movie: "Toofan", venue: "Star Cineplex", amount: 450, seats: "E12", status: "CANCELLED", time: "18 mins ago" },
];

export function DashboardClientView() {
  const { dateRange } = useUIStore();
  const { data: statsData, isFetching, refetch } = useDashboardStatsQuery();

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Executive Overview</h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              Live Operations
            </Badge>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Platform performance metrics, real-time ticket sales, and venue occupancy context.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5 font-bold">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Top 8 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(statsData?.totalRevenueBDT || 12450000)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+14.8%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tickets Sold
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatNumber(statsData?.ticketsSold || 28450)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+8.2%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatNumber(statsData?.activeUsers || 142800)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+22.4%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">new accounts</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Avg Occupancy
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">88.4%</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+5.1%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">peak weekend rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border/80 space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold text-foreground">Revenue Collection Trend</CardTitle>
            <CardDescription className="text-xs">Gross revenue vs net platform collection across the current period.</CardDescription>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#grossGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/80 space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold text-foreground">Top Performing Movies</CardTitle>
            <CardDescription className="text-xs">Highest grossing films ranked by ticket revenue.</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {TOP_MOVIES.map((m) => (
              <div key={m.rank} className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-md bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    #{m.rank}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-foreground">{m.title}</span>
                    <span className="text-[10px] text-muted-foreground">{m.language} • {m.occupancy}% Occupancy</span>
                  </div>
                </div>
                <span className="font-bold text-xs text-foreground">{formatCurrency(m.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
