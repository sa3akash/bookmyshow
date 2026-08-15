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

export default function DashboardOverviewPage() {
  const { dateRange } = useUIStore();

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
          </div>
          <p className="text-xs text-muted-foreground">
            Platform performance metrics, real-time ticket sales, and venue occupancy context.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10">
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
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
            <div className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(12450000)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+14.8%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Today's Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(485000)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+8.2%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="hover:border-sky-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Bookings
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatNumber(8520)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+12.1%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tickets Sold
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatNumber(18420)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+15.4%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5 */}
        <Card className="hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatNumber(12450)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+22.1%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">DAU active</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6 */}
        <Card className="hover:border-amber-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Occupancy Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">78.4%</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+4.5%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">vs avg capacity</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 7 */}
        <Card className="hover:border-teal-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Payment Success Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">98.4%</div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>+0.5%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">bKash / Nagad</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 8 */}
        <Card className="hover:border-rose-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-rose-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Refund Amount
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(125000)}</div>
            <div className="flex items-center text-xs text-rose-400 font-semibold mt-1">
              <TrendingDown className="h-3.5 w-3.5 mr-1" />
              <span>-0.1%</span>
              <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">0.85% refund rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Revenue Chart & Live Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Spans 2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Revenue Trend & Growth</CardTitle>
              <CardDescription className="text-xs">Gross vs Net Revenue timeline</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">Weekly Breakdown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `৳${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: any) => [`৳${(value || 0).toLocaleString()}`, "Amount"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#grossGrad)" name="Gross Revenue" />
                  <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" name="Net Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Operations Panel (Rule 20) */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" /> Live Operations
              </CardTitle>
              <Badge variant="success" className="text-[10px] font-extrabold tracking-widest uppercase">
                LIVE
              </Badge>
            </div>
            <CardDescription className="text-xs">Real-time WebSocket event stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-xs text-muted-foreground font-medium">Active Users Right Now</span>
              <span className="text-sm font-black text-foreground">1,420 users</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-xs text-muted-foreground font-medium">Seats Held In Checkout</span>
              <span className="text-sm font-black text-amber-400">84 seats</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-xs text-muted-foreground font-medium">Payment Rate</span>
              <span className="text-sm font-black text-emerald-400">98.4% success</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-xs text-muted-foreground font-medium">Background Queue Lag</span>
              <span className="text-sm font-black text-sky-400">0 ms (Healthy)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Movies & Top Venues Tables (Rule 18 & 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movies Ranking Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" /> Top Grossing Movies
              </CardTitle>
              <CardDescription className="text-xs">Ranked by revenue & occupancy</CardDescription>
            </div>
            <a href="/movies" className="text-xs font-semibold text-primary hover:underline">
              View All
            </a>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="pb-2 font-semibold">Rank & Title</th>
                    <th className="pb-2 font-semibold">Bookings</th>
                    <th className="pb-2 font-semibold">Occupancy</th>
                    <th className="pb-2 font-semibold text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {TOP_MOVIES.map((m) => (
                    <tr key={m.rank} className="hover:bg-muted/30">
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-4">#{m.rank}</span>
                        <span className="truncate max-w-[150px] font-semibold text-foreground">{m.title}</span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{m.bookings}</td>
                      <td className="py-2.5 font-semibold text-emerald-400">{m.occupancy}%</td>
                      <td className="py-2.5 font-bold text-foreground text-right">{formatCurrency(m.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Venues Ranking Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500" /> Top Performing Venues
              </CardTitle>
              <CardDescription className="text-xs">Ranked by ticket volume & revenue</CardDescription>
            </div>
            <a href="/venues" className="text-xs font-semibold text-primary hover:underline">
              View All
            </a>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="pb-2 font-semibold">Rank & Venue</th>
                    <th className="pb-2 font-semibold">City</th>
                    <th className="pb-2 font-semibold">Tickets</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {TOP_VENUES.map((v) => (
                    <tr key={v.rank} className="hover:bg-muted/30">
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-4">#{v.rank}</span>
                        <span className="truncate max-w-[160px] font-semibold text-foreground">{v.name}</span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{v.city}</td>
                      <td className="py-2.5 text-muted-foreground">{v.tickets}</td>
                      <td className="py-2.5 font-bold text-foreground text-right">{formatCurrency(v.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table (Rule 21) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Recent Ticket Bookings</CardTitle>
            <CardDescription className="text-xs">Latest customer transactions across all shows</CardDescription>
          </div>
          <a href="/bookings" className="text-xs font-semibold text-primary hover:underline">
            Manage All Bookings
          </a>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="pb-2 font-semibold">Booking ID</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Movie</th>
                  <th className="pb-2 font-semibold">Seats</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {RECENT_BOOKINGS.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 cursor-pointer">
                    <td className="py-2.5 font-bold text-primary">{b.id}</td>
                    <td className="py-2.5 font-medium text-foreground">{b.customer}</td>
                    <td className="py-2.5 text-muted-foreground">{b.movie}</td>
                    <td className="py-2.5 text-muted-foreground font-mono text-[11px]">{b.seats}</td>
                    <td className="py-2.5 font-bold text-foreground">{formatCurrency(b.amount)}</td>
                    <td className="py-2.5">
                      <Badge
                        variant={b.status === "CONFIRMED" ? "success" : b.status === "PENDING" ? "warning" : "destructive"}
                        className="text-[10px]"
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-right">{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
