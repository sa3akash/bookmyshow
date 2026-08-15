import { SeatItem } from "@/types";

export interface NormalizedLayout {
  seats: SeatItem[];
  rows: { rowLabel: string; y: number; seats: SeatItem[] }[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
}

export function normalizeSeatLayout(rawSeats: SeatItem[]): NormalizedLayout {
  if (!rawSeats || rawSeats.length === 0) {
    return {
      seats: [],
      rows: [],
      bounds: { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 },
    };
  }

  // Group seats by rowLabel
  const rowMap = new Map<string, SeatItem[]>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rawSeats.forEach((s) => {
    const row = s.rowLabel || "A";
    const existing = rowMap.get(row) || [];
    existing.push(s);
    rowMap.set(row, existing);

    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x + s.width > maxX) maxX = s.x + s.width;
    if (s.y + s.height > maxY) maxY = s.y + s.height;
  });

  const rows = [...rowMap.entries()].map(([rowLabel, rowSeats]) => {
    // Sort seats in row by x coordinate
    rowSeats.sort((a, b) => a.x - b.x);
    const avgY = rowSeats.reduce((acc, s) => acc + s.y, 0) / rowSeats.length;
    return { rowLabel, y: avgY, seats: rowSeats };
  });

  // Sort rows top-to-bottom
  rows.sort((a, b) => a.y - b.y);

  return {
    seats: rawSeats,
    rows,
    bounds: {
      minX: isFinite(minX) ? minX : 0,
      minY: isFinite(minY) ? minY : 0,
      maxX: isFinite(maxX) ? maxX : 800,
      maxY: isFinite(maxY) ? maxY : 600,
      width: isFinite(maxX - minX) ? Math.max(760, maxX - minX + 100) : 800,
      height: isFinite(maxY - minY) ? Math.max(500, maxY - minY + 120) : 600,
    },
  };
}
