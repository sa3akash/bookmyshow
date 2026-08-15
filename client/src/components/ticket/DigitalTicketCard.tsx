"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Film, MapPin, Calendar, Clock, Tv, Ticket, CheckCircle2 } from "lucide-react";
import { Booking } from "@/types";
import { formatCurrency, formatDateString } from "@/lib/utils";

interface DigitalTicketCardProps {
  booking: Booking;
}

export function DigitalTicketCard({ booking }: DigitalTicketCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-[#090c14] shadow-2xl">
      {/* Top Banner Gradient Header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 p-6 text-white text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black/20 py-1 px-3 rounded-full w-fit mx-auto backdrop-blur-md">
          <CheckCircle2 className="h-3.5 w-3.5" /> Official Digital Ticket
        </div>
        <h2 className="text-xl font-black tracking-tight">{booking.movieTitle}</h2>
        <p className="text-xs text-white/90 font-medium">
          {booking.format} • {booking.language}
        </p>
      </div>

      {/* Ticket Details Body */}
      <div className="p-6 space-y-5 text-slate-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">Cinema & Hall</span>
            <p className="font-bold text-white mt-0.5">{booking.venueName}</p>
            <p className="text-[11px] text-slate-400">{booking.screenName}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">Show Date & Time</span>
            <p className="font-bold text-white mt-0.5">{formatDateString(booking.showDate)}</p>
            <p className="text-[11px] text-rose-400 font-mono font-bold">{booking.startTime}</p>
          </div>
        </div>

        {/* Seats Badge Box */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold uppercase text-rose-300 tracking-wider">
            Confirmed Seats ({booking.seatLabels.length})
          </span>
          <div className="font-mono text-lg font-black text-white tracking-widest">
            {booking.seatLabels.join(", ")}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <QRCodeSVG value={booking.qrCodeToken || booking.bookingId} size={140} />
          </div>
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-widest">
            BOOKING ID: {booking.bookingId}
          </span>
          <span className="text-[9px] text-slate-500 text-center">
            Scan this QR code at cinema entrance scanner
          </span>
        </div>

        {/* Payment Summary */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
          <span className="text-slate-400">Total Paid</span>
          <span className="font-mono font-black text-emerald-400 text-sm">
            {formatCurrency(booking.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
