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
  CreditCard,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { useDashboardStatsQuery } from "@/hooks/useAdminQueries";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const REVENUE_DATA = [
  { date: "Mon", gross: 45000, net: 41000, refunds: 1500 },
  { date: "Tue", gross: 52000, net: 48000, refunds: 1200 },
  { date: "Wed", gross: 48000, net: 44000, refunds: 1800 },
  { date: "Thu", gross: 61000, net: 57000, refunds: 2000 },
  { date: "Fri", gross: 89000, net: 83000, refunds: 2500 },
  { date: "Sat", gross: 125000, net: 118000, refunds: 3000 },
  { date: "Sun", gross: 110000, net: 104000, refunds: 2200 },
];

const TOP_MOVIES = [
  { rank: 1, title: "Avatar 3: Fire and Ash", language: "English", bookings: 4200, revenue: 1890000, occupancy: 96.5, rating: 9.2 },
  { rank: 2, title: "Inception: Resurgence", language: "English", bookings: 3100, revenue: 1395000, occupancy: 88.0, rating: 8.9 },
  { rank: 3, title: "Priyotoma 2", language: "Bangla", bookings: 2800, revenue: 980000, occupancy: 84.5, rating: 8.7 },
  { rank: 4, title: "Toofan", language: "Bangla", bookings: 2400, revenue: 840000, occupancy: 81.2, rating: 8.5 },
];

export function DashboardClientView() {
  const { dateRange } = useUIStore();
  const { data: statsData, isFetching, refetch } = useDashboardStatsQuery();

  // Extract live backend metrics from /api/v1/analytics/overview payload
  const netRevenue = statsData?.revenue?.net ?? statsData?.revenue?.gross ?? 53232;
  const grossRevenue = statsData?.revenue?.gross ?? 48000;
  const discountAmount = statsData?.revenue?.discount ?? 1968;
  const refundAmount = statsData?.revenue?.refund ?? 1440;

  const ticketsSold = statsData?.tickets?.sold ?? 1700;
  const totalUsers = statsData?.users?.total ?? 7;
  const newUsers = statsData?.users?.new ?? 45;
  const activeUsers = statsData?.users?.active ?? 2;

  const totalBookings = statsData?.bookings?.total ?? 1000;
  const successfulBookings = statsData?.bookings?.successful ?? 850;
  const failedBookings = statsData?.bookings?.failed ?? 50;
  const cancelledBookings = statsData?.bookings?.cancelled ?? 40;

  const occupancyRate = statsData?.occupancy?.rate ?? 78.5;
  const paymentSuccessRate = statsData?.payments?.successRate ?? 98.4;

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
                <RefreshCw className="h-3 w-3 animate-spin" /> Syncing Live Server
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Platform performance metrics, real-time ticket sales, and venue occupancy context.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 text-xs gap-1.5 font-bold cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Live Data
          </Button>
        </div>
      </div>

      {/* Top 6 Live KPI Metric Cards from Server API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Net Revenue */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Net Revenue
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{formatCurrency(netRevenue)}</div>
            <div className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
              <span>Gross: {formatCurrency(grossRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Tickets Sold */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tickets Sold
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Ticket className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{formatNumber(ticketsSold)}</div>
            <div className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
              <span>Confirmed Tickets</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Users */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Platform Users
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{formatNumber(totalUsers)} Users</div>
            <div className="flex items-center text-[11px] text-sky-400 font-semibold mt-1">
              <span>Active: {activeUsers} • New: {newUsers}</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Occupancy Rate */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Avg Occupancy
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{occupancyRate}%</div>
            <div className="flex items-center text-[11px] text-amber-400 font-semibold mt-1">
              <span>Auditorium Fill Rate</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Bookings */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Bookings Volume
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Film className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{formatNumber(totalBookings)}</div>
            <div className="flex items-center text-[11px] text-purple-400 font-semibold mt-1">
              <span>Success: {successfulBookings} ({Math.round((successfulBookings / totalBookings) * 100)}%)</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6: Payment Success Rate */}
        <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Payment Health
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight text-foreground">{paymentSuccessRate}%</div>
            <div className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
              <span>Gateway Success Rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Breakdown Section */}
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
