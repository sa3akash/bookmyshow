import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SeatItem, Show, Coupon } from "@/types";

interface BookingFlowState {
  show: Show | null;
  selectedSeats: SeatItem[];
  holdId: string | null;
  expiresAt: string | null;
  coupon: Coupon | null;
  convenienceFeePerSeat: number;
  taxPercent: number;

  setShow: (show: Show) => void;
  setSelectedSeats: (seats: SeatItem[]) => void;
  toggleSeat: (seat: SeatItem) => void;
  setSeatHold: (holdId: string, expiresAt: string) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearBooking: () => void;

  getSubtotal: () => number;
  getConvenienceFee: () => number;
  getTaxAmount: () => number;
  getDiscountAmount: () => number;
  getTotalAmount: () => number;
}

export const useBookingStore = create<BookingFlowState>()(
  persist(
    (set, get) => ({
      show: null,
      selectedSeats: [],
      holdId: null,
      expiresAt: null,
      coupon: null,
      convenienceFeePerSeat: 20,
      taxPercent: 5,

      setShow: (show) => set({ show }),

      setSelectedSeats: (seats) => set({ selectedSeats: seats }),

      toggleSeat: (seat) => {
        const current = get().selectedSeats;
        const exists = current.some((s) => s.id === seat.id);
        if (exists) {
          set({ selectedSeats: current.filter((s) => s.id !== seat.id) });
        } else {
          set({ selectedSeats: [...current, seat] });
        }
      },

      setSeatHold: (holdId, expiresAt) => set({ holdId, expiresAt }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      clearBooking: () =>
        set({
          selectedSeats: [],
          holdId: null,
          expiresAt: null,
          coupon: null,
        }),

      getSubtotal: () => {
        return get().selectedSeats.reduce((acc, s) => acc + s.price, 0);
      },

      getConvenienceFee: () => {
        return get().selectedSeats.length * get().convenienceFeePerSeat;
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        const fee = get().getConvenienceFee();
        return Math.round((subtotal + fee) * (get().taxPercent / 100));
      },

      getDiscountAmount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        if (coupon.discountAmount) return coupon.discountAmount;
        if (coupon.discountPercent) return Math.round((subtotal * coupon.discountPercent) / 100);
        return 0;
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal();
        const fee = get().getConvenienceFee();
        const tax = get().getTaxAmount();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal + fee + tax - discount);
      },
    }),
    {
      name: "bms_active_booking",
      partialize: (state) => ({
        show: state.show,
        selectedSeats: state.selectedSeats,
        holdId: state.holdId,
        expiresAt: state.expiresAt,
        coupon: state.coupon,
      }),
    }
  )
);
