"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle2, Ticket, Home, RefreshCw } from "lucide-react";
import { useBookingStore } from "@/stores/booking.store";
import { useBookingDetailsQuery } from "@/hooks/useClientQueries";
import { DigitalTicketCard } from "@/components/ticket/DigitalTicketCard";

interface ConfirmationPageProps {
  params: Promise<{ showId: string; bookingId: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { showId, bookingId } = use(params);
  const { clearBooking } = useBookingStore();

  const { data: booking, isLoading } = useBookingDetailsQuery(bookingId);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  if (isLoading || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Retrieving digital ticket confirmation from server...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Celebration Header */}
      <div className="text-center space-y-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-xs text-slate-400">
          Your digital ticket is issued and ready. Check your email & account history.
        </p>
      </div>

      {/* Digital Ticket Card Component */}
      <DigitalTicketCard booking={booking} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/bookings"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-black uppercase text-white shadow-xl shadow-rose-600/30 hover:bg-rose-500"
        >
          <Ticket className="h-4 w-4" /> View My Bookings
        </Link>

        <Link
          href="/"
          onClick={clearBooking}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
