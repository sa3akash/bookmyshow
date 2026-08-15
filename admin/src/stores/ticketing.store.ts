import { create } from "zustand";
import { SeatLayout, SeatItem, SeatCategory, SeatPhysicalStatus } from "../types";

interface TicketingState {
  seatLayouts: SeatLayout[];
  updateSeatLayout: (layoutId: string, updates: Partial<SeatLayout>) => void;
  toggleSeatStatus: (layoutId: string, seatId: string) => void;
  updateSeatPrice: (layoutId: string, seatId: string, price: number) => void;
}

const generateMockLayout = (id: string, name: string, rowsCount: number, colsCount: number): SeatLayout => {
  const rows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));
  const seats: SeatItem[] = [];

  rows.forEach((row, rowIndex) => {
    for (let col = 1; col <= colsCount; col++) {
      let category: SeatCategory = "SILVER";
      let basePrice = 320;
      let type: SeatItem["type"] = "STANDARD";

      if (col === 5 || col === 12) {
        type = "WALKWAY";
      } else if (rowIndex <= 1) {
        category = "RECLINER";
        basePrice = 850;
        type = "RECLINER";
      } else if (rowIndex <= 3) {
        category = "PLATINUM";
        basePrice = 550;
      } else if (rowIndex <= 5) {
        category = "GOLD";
        basePrice = 420;
      }

      seats.push({
        id: `${id}-${row}-${col}`,
        row,
        col,
        label: type === "WALKWAY" ? "" : `${row}${col}`,
        category,
        basePrice,
        status: "AVAILABLE",
        type,
      });
    }
  });

  return {
    id,
    name,
    screenType: "IMAX 3D Laser",
    totalSeats: seats.filter((s) => s.type !== "WALKWAY").length,
    rowsCount,
    colsCount,
    seats,
  };
};

const INITIAL_LAYOUTS: SeatLayout[] = [
  generateMockLayout("layout-imax-hyd-1", "Star Cineplex - IMAX Hall 1", 8, 16),
  generateMockLayout("layout-vip-lounge-2", "Blockbuster Cinemas - VIP Suite", 5, 12),
  generateMockLayout("layout-4dx-hall-3", "Silver Screen - 4DX Motion Hall", 6, 14),
];

export const useTicketingStore = create<TicketingState>((set) => ({
  seatLayouts: INITIAL_LAYOUTS,

  updateSeatLayout: (layoutId, updates) =>
    set((state) => ({
      seatLayouts: state.seatLayouts.map((l) =>
        l.id === layoutId ? { ...l, ...updates } : l
      ),
    })),

  toggleSeatStatus: (layoutId, seatId) =>
    set((state) => ({
      seatLayouts: state.seatLayouts.map((layout) => {
        if (layout.id !== layoutId) return layout;
        return {
          ...layout,
          seats: layout.seats.map((seat) => {
            if (seat.id !== seatId) return seat;
            const newStatus: SeatPhysicalStatus = seat.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED";
            return { ...seat, status: newStatus };
          }),
        };
      }),
    })),

  updateSeatPrice: (layoutId, seatId, price) =>
    set((state) => ({
      seatLayouts: state.seatLayouts.map((layout) => {
        if (layout.id !== layoutId) return layout;
        return {
          ...layout,
          seats: layout.seats.map((seat) => {
            if (seat.id !== seatId) return seat;
            return { ...seat, basePrice: price };
          }),
        };
      }),
    })),
}));
