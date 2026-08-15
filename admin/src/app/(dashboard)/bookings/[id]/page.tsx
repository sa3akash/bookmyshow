"use client";

import * as React from "react";
import { ArrowLeft, Ticket, CheckCircle2, RotateCcw, Download, Mail, DollarSign, Clock, ShieldCheck, User, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Can } from "@/components/permissions/Can";

export default function BookingDetailPage() {
  const booking = {
    id: "BK-88120",
    customerName: "Tanvir Rahman",
    customerEmail: "tanvir@example.com",
    customerPhone: "+8801711223344",
    movieTitle: "Avatar 3: Fire and Ash",
    venueName: "Star Cineplex - Bashundhara City",
    screenName: "Hall 1 (IMAX 3D)",
    showTime: "Saturday, Aug 15, 2026 • 10:30 AM",
    seats: ["C4", "C5", "C6"],
    ticketPriceBDT: 450,
    subtotalBDT: 1350,
    platformFeeBDT: 50,
    taxBDT: 25,
    discountBDT: 100,
    totalBDT: 1325,
    paymentProvider: "BKASH",
    paymentTxnId: "TXN-BK-998811",
    paymentStatus: "SUCCESS",
    bookingStatus: "CONFIRMED",
    createdAt: "2026-08-15T06:05:00Z",
  };

  const timeline = [
    { title: "Booking Created", time: "10:30:02 AM", desc: "User selected 3 seats in Hall 1" },
    { title: "Seat Hold Acquired", time: "10:30:04 AM", desc: "Seats C4, C5, C6 locked for 10 mins" },
    { title: "Payment Initiated", time: "10:31:12 AM", desc: "bKash payment gateway checkout opened" },
    { title: "Payment Successful", time: "10:31:45 AM", desc: "bKash Txn ID #TXN-BK-998811 verified" },
    { title: "Ticket Generated", time: "10:31:46 AM", desc: "QR Ticket #TKT-BK-88120 issued" },
    { title: "SMS & Email Sent", time: "10:31:50 AM", desc: "Notification delivered to +8801711223344" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/bookings">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">{booking.id}</h1>
              <Badge variant="success" className="text-[10px] font-bold">
                {booking.bookingStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Booked on {formatDate(booking.createdAt, "PPP 'at' p")}</p>
          </div>
        </div>

        {/* Permission-Protected Action Buttons (Rule 33) */}
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="booking:cancel">
            <Button variant="destructive" size="sm" className="h-9 text-xs gap-1.5 font-bold">
              <RotateCcw className="h-3.5 w-3.5" /> Cancel Booking
            </Button>
          </Can>
          <Can permission="payment:refund">
            <a href="/refunds">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-bold text-amber-500 border-amber-500/30">
                <DollarSign className="h-3.5 w-3.5" /> Initiate Refund
              </Button>
            </a>
          </Can>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Resend Ticket
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF Ticket
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Details & Pricing Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" /> Movie & Showtime Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Movie</span>
                  <span className="font-bold text-foreground text-sm">{booking.movieTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Showtime</span>
                  <span className="font-semibold text-foreground">{booking.showTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Cinema Venue</span>
                  <span className="font-semibold text-foreground">{booking.venueName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Hall / Screen</span>
                  <span className="font-semibold text-foreground">{booking.screenName}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-1">Reserved Seats</span>
                <div className="flex gap-2">
                  {booking.seats.map((s) => (
                    <Badge key={s} variant="info" className="font-mono text-xs px-2 py-0.5 font-bold">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Financial & Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Subtotal ({booking.seats.length} Tickets @ ৳450)</span>
                <span className="font-semibold text-foreground">{formatCurrency(booking.subtotalBDT)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Platform Service Fee</span>
                <span className="font-semibold text-foreground">+{formatCurrency(booking.platformFeeBDT)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Government Tax (5%)</span>
                <span className="font-semibold text-foreground">+{formatCurrency(booking.taxBDT)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Coupon Discount (PROMO100)</span>
                <span className="font-semibold text-rose-400">-{formatCurrency(booking.discountBDT)}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-sm text-foreground">
                <span>Total Amount Paid</span>
                <span className="text-emerald-400">{formatCurrency(booking.totalBDT)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Profile & Booking Timeline (Rule 32) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Name</span>
                <span className="font-bold text-foreground">{booking.customerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Phone</span>
                <span className="font-semibold text-foreground">{booking.customerPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Email</span>
                <span className="font-semibold text-foreground">{booking.customerEmail}</span>
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" /> Booking Audit Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 relative pb-3 border-l border-border/60 pl-3">
                  <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary border border-background" />
                  <div>
                    <span className="font-bold text-foreground block">{step.title}</span>
                    <span className="text-[10px] text-muted-foreground block">{step.desc}</span>
                    <span className="text-[9px] text-primary/80 font-mono">{step.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
