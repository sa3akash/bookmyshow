export type SeatCategory = "RECLINER" | "PLATINUM" | "GOLD" | "SILVER" | "VIP" | "COUPLE" | "ACCESSIBLE";

export type SeatPhysicalStatus = "AVAILABLE" | "BLOCKED" | "HELD" | "BOOKED";

export interface SeatItem {
  id: string;
  row: string;
  col: number;
  label: string;
  category: SeatCategory;
  basePrice: number;
  status: SeatPhysicalStatus;
  type: "STANDARD" | "RECLINER" | "COUPLE_LEFT" | "COUPLE_RIGHT" | "WHEELCHAIR" | "WALKWAY";
}

export interface SeatLayout {
  id: string;
  name: string;
  screenType: string;
  totalSeats: number;
  rowsCount: number;
  colsCount: number;
  seats: SeatItem[];
}
