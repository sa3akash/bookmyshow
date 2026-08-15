"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ticket, RefreshCw } from "lucide-react";
import { useBookingStore } from "@/stores/booking.store";
import { useShowSeatsQuery, useCreateSeatHoldMutation } from "@/hooks/useClientQueries";
import { generateMockShows } from "@/lib/api/client";
import { SpatialSeatMap } from "@/components/seat/SpatialSeatMap";
import { SeatLegend } from "@/components/seat/SeatLegend";
import { SeatHoldTimer } from "@/components/seat/SeatHoldTimer";
import { BookingSummary } from "@/components/booking/BookingSummary";

interface SeatSelectionPageProps {
  params: Promise<{ showId: string }>;
}

export default function SeatSelectionPage({ params }: SeatSelectionPageProps) {
  const { showId } = use(params);
  const router = useRouter();

  const {
    show,
    selectedSeats,
    holdId,
    expiresAt,
    setShow,
    toggleSeat,
    setSeatHold,
    getTotalAmount,
  } = useBookingStore();

  const mockShow =
    show ||
    generateMockShows("movie_avatar3", "city_dhaka", new Date().toISOString().split("T")[0])[0];

  const { data: seatsList = [], isLoading: isSeatsLoading } = useShowSeatsQuery(
    mockShow.screenId || "scr_default",
    showId,
    mockShow.basePrice
  );

  const seatHoldMutation = useCreateSeatHoldMutation();

  useEffect(() => {
    setShow(mockShow);
  }, [mockShow, setShow]);

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) return;

    const result = await seatHoldMutation.mutateAsync({
      showId,
      seatIds: selectedSeats.map((s) => s.id),
    });

    setSeatHold(result.holdId, result.expiresAt);
    router.push(`/booking/${showId}/checkout`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Navigation & Show Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{mockShow.movieTitle}</span>
              <span className="text-xs text-rose-400 font-normal">({mockShow.format})</span>
              {isSeatsLoading && <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {mockShow.venueName} • {mockShow.screenName} •{" "}
              <strong className="text-white">{mockShow.startTime}</strong>
            </p>
          </div>
        </div>

        {/* Seat Hold Countdown (if lock active) */}
        {expiresAt && <SeatHoldTimer expiresAt={expiresAt} />}
      </div>

      {/* Spatial Seat Map */}
      <SpatialSeatMap
        seats={seatsList}
        selectedSeatIds={selectedSeatIds}
        onSeatToggle={toggleSeat}
        maxSeatsLimit={8}
      />

      {/* Seat Legend */}
      <SeatLegend />

      {/* Sticky Bottom Booking Summary Bar */}
      <BookingSummary
        show={mockShow}
        selectedSeats={selectedSeats}
        totalAmount={getTotalAmount()}
        onProceed={handleProceedToCheckout}
        isLoading={seatHoldMutation.isPending}
      />
    </div>
  );
}
