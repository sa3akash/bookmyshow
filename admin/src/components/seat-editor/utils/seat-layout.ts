import { SeatCategory, SeatItem } from "@/types";

export type SeatSource = "DB" | "LOCAL";

export type RenderSeat = SeatItem & {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  source: SeatSource;
  dbRowLabel?: string;
  dbColumnNumber?: number;
};

export interface DbSeat {
  id: string;
  screenId: string;
  rowLabel?: string | null;
  columnNumber?: number | string | null;
  seatNumber?: string | null;
  type?: string | null;
  category?: string | null;
  x?: number | string | null;
  y?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  rotation?: number | string | null;
  priceMultiplier?: number | string | null;
  basePrice?: number | string | null;
  price?: number | string | null;
  status?: string | null;
  isActive?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

export interface SeatLayoutEnvelope {
  seats?: DbSeat[];
  data?: DbSeat[] | { seats?: DbSeat[] };
}

const CATEGORY_ALIASES: Record<string, SeatCategory> = {
  STANDARD: "SILVER",
  REGULAR: "SILVER",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  VIP: "VIP",
  RECLINER: "RECLINER",
  COUPLE: "COUPLE",
  ACCESSIBLE: "ACCESSIBLE",
};

const TYPE_ALIASES: Record<string, SeatItem["type"]> = {
  STANDARD: "STANDARD",
  REGULAR: "STANDARD",
  RECLINER: "RECLINER",
  WHEELCHAIR: "WHEELCHAIR",
  ACCESSIBLE: "WHEELCHAIR",
  COUPLE_LEFT: "COUPLE_LEFT",
  COUPLE_RIGHT: "COUPLE_RIGHT",
  WALKWAY: "WALKWAY",
};

const num = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanRow = (value: unknown) =>
  String(value ?? "").trim().toUpperCase();

const parseColumn = (seat: DbSeat, row: string) => {
  const direct = num(seat.columnNumber, NaN);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const label = String(seat.seatNumber ?? "").trim();
  const match = label.match(new RegExp(`^${row}\\s*0*(\\d+)$`, "i"));
  return match ? Number(match[1]) : 0;
};

export function extractDbSeats(payload: unknown): DbSeat[] {
  if (Array.isArray(payload)) return payload as DbSeat[];

  const value = payload as SeatLayoutEnvelope | null | undefined;
  if (Array.isArray(value?.seats)) return value.seats;

  if (Array.isArray(value?.data)) return value.data;

  if (value?.data && !Array.isArray(value.data)) {
    if (Array.isArray(value.data.seats)) return value.data.seats;
  }

  return [];
}

export function normalizeDbSeat(
  seat: DbSeat,
  priceDefaults: Partial<Record<SeatCategory, number>> = {},
): RenderSeat {
  const row = cleanRow(seat.rowLabel);
  const col = parseColumn(seat, row);
  const rawCategory = String(seat.category ?? "STANDARD").trim().toUpperCase();
  const rawType = String(seat.type ?? "STANDARD").trim().toUpperCase();

  const category = CATEGORY_ALIASES[rawCategory] ?? "SILVER";
  const type = TYPE_ALIASES[rawType] ?? "STANDARD";

  const fallbackPrice = priceDefaults[category] ?? 350;
  const multiplier = num(seat.priceMultiplier, 1);

  return {
    id: seat.id,
    row,
    col,
    label: seat.seatNumber || `${row}${col}`,
    category,
    basePrice: num(
      seat.basePrice ?? seat.price,
      Math.round(fallbackPrice * multiplier),
    ),
    status:
      seat.status === "BLOCKED" || seat.isActive === false
        ? "BLOCKED"
        : "AVAILABLE",
    type,
    x: num(seat.x, 0),
    y: num(seat.y, 0),
    width: Math.max(12, num(seat.width, 30)),
    height: Math.max(12, num(seat.height, 30)),
    rotation: num(seat.rotation, 0),
    source: "DB",
    dbRowLabel: row,
    dbColumnNumber: col,
  };
}

export function normalizeLocalSeat(
  seat: SeatItem,
  index: number,
  spacingX = 36,
  spacingY = 48,
): RenderSeat {
  return {
    ...seat,
    x: num((seat as SeatItem & Partial<RenderSeat>).x, 40 + (seat.col - 1) * spacingX),
    y: num((seat as SeatItem & Partial<RenderSeat>).y, 90 + index * spacingY),
    width: num((seat as SeatItem & Partial<RenderSeat>).width, 30),
    height: num((seat as SeatItem & Partial<RenderSeat>).height, 30),
    rotation: num((seat as SeatItem & Partial<RenderSeat>).rotation, 0),
    source: "LOCAL",
  };
}

export interface LayoutBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function getLayoutBounds(
  seats: RenderSeat[],
  padding = 90,
): LayoutBounds {
  if (!seats.length) {
    return {
      minX: 0,
      minY: 0,
      maxX: 800,
      maxY: 520,
      width: 800,
      height: 520,
    };
  }

  const minX = Math.min(...seats.map((s) => s.x));
  const minY = Math.min(...seats.map((s) => s.y));
  const maxX = Math.max(...seats.map((s) => s.x + s.width));
  const maxY = Math.max(...seats.map((s) => s.y + s.height));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(800, maxX - minX + padding * 2),
    height: Math.max(520, maxY - minY + padding * 2),
  };
}

export function getSeatRows(seats: RenderSeat[]) {
  const map = new Map<string, RenderSeat[]>();

  for (const seat of seats) {
    if (!seat.row) continue;
    const list = map.get(seat.row) ?? [];
    list.push(seat);
    map.set(seat.row, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => a.col - b.col),
      y:
        rowSeats.reduce((sum, seat) => sum + seat.y, 0) /
        Math.max(1, rowSeats.length),
    }));
}

export function validateSeatLayout(seats: RenderSeat[]) {
  const issues: string[] = [];

  if (!seats.length) issues.push("No seats found.");

  const missingRow = seats.filter((s) => !s.row);
  if (missingRow.length) {
    issues.push(`${missingRow.length} seats have no row label.`);
  }

  const duplicateIds = new Set<string>();
  const duplicateSeatKeys = new Set<string>();

  for (const seat of seats) {
    if (duplicateIds.has(seat.id)) issues.push(`Duplicate seat id: ${seat.id}`);
    duplicateIds.add(seat.id);

    const key = `${seat.row}:${seat.col}`;
    if (duplicateSeatKeys.has(key)) {
      issues.push(`Duplicate position: ${key}`);
    }
    duplicateSeatKeys.add(key);
  }

  const rows = new Set(seats.map((s) => s.row).filter(Boolean));
  if (rows.size === 1 && seats.length > 20) {
    issues.push("All seats belong to one row. Check rowLabel in the API response.");
  }

  const coordinatesMissing = seats.filter(
    (s) => !Number.isFinite(s.x) || !Number.isFinite(s.y),
  );
  if (coordinatesMissing.length) {
    issues.push(`${coordinatesMissing.length} seats have invalid coordinates.`);
  }

  return {
    valid: issues.length === 0,
    issues: [...new Set(issues)],
  };
}

export function autoArrangeSeats(seats: RenderSeat[], startY = 60, rowSpacing = 48, colSpacing = 36): RenderSeat[] {
  const rowsMap = new Map<string, RenderSeat[]>();

  for (const s of seats) {
    const list = rowsMap.get(s.row) ?? [];
    list.push(s);
    rowsMap.set(s.row, list);
  }

  const sortedRows = [...rowsMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  const arranged: RenderSeat[] = [];

  sortedRows.forEach(([rowLabel, rowSeats], rowIndex) => {
    const sortedCols = [...rowSeats].sort((a, b) => a.col - b.col);
    const y = startY + rowIndex * rowSpacing;

    sortedCols.forEach((seat, colIndex) => {
      const x = 50 + colIndex * colSpacing;
      arranged.push({
        ...seat,
        row: rowLabel,
        col: seat.col || colIndex + 1,
        x,
        y,
        width: seat.width || 30,
        height: seat.height || 30,
      });
    });
  });

  return arranged;
}

export function createRowSeats(
  rowLabel: string,
  seatCount: number,
  category: SeatCategory = "SILVER",
  yPos = 100,
  basePrice = 320,
): RenderSeat[] {
  const newSeats: RenderSeat[] = [];
  const cleanRowLabel = rowLabel.trim().toUpperCase() || "A";

  for (let col = 1; col <= seatCount; col++) {
    const seatId = `new-seat-${cleanRowLabel}-${col}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    newSeats.push({
      id: seatId,
      row: cleanRowLabel,
      col,
      label: `${cleanRowLabel}${col}`,
      category,
      basePrice,
      status: "AVAILABLE",
      type: "STANDARD",
      x: 50 + (col - 1) * 36,
      y: yPos,
      width: 30,
      height: 30,
      rotation: 0,
      source: "LOCAL",
    });
  }

  return newSeats;
}

export function serializeSeatsForDb(
  seats: RenderSeat[],
  prices: Partial<Record<SeatCategory, number>> = {},
) {
  return seats.map((s) => {
    const defaultCatPrice = prices[s.category] ?? s.basePrice ?? 350;
    const priceMult = defaultCatPrice > 0 ? (s.basePrice / defaultCatPrice).toFixed(2) : "1.00";

    return {
      id: s.source === "DB" && !s.id.startsWith("new-seat-") ? s.id : undefined,
      rowLabel: s.row,
      columnNumber: s.col,
      seatNumber: s.label || `${s.row}${s.col}`,
      type: s.type === "WALKWAY" ? "WALKWAY" : s.type === "WHEELCHAIR" ? "WHEELCHAIR" : s.type === "RECLINER" ? "RECLINER" : s.type === "COUPLE_LEFT" || s.type === "COUPLE_RIGHT" ? "COUPLE" : "REGULAR",
      category: s.category,
      priceMultiplier: priceMult,
      x: Math.round(s.x),
      y: Math.round(s.y),
      width: Math.round(s.width),
      height: Math.round(s.height),
      rotation: Math.round(s.rotation),
      isActive: s.status !== "BLOCKED",
    };
  });
}

export function prepareSavePayload(
  screenId?: string,
  venueId?: string,
  seats: RenderSeat[] = [],
  prices: Partial<Record<SeatCategory, number>> = {},
  screenName?: string,
) {
  const activeSeats = seats.filter((s) => s.type !== "WALKWAY" && s.status !== "BLOCKED");
  return {
    screenId,
    venueId,
    name: screenName || "Auditorium Screen",
    totalSeats: activeSeats.length,
    seats: serializeSeatsForDb(seats, prices),
  };
}

export function renameRow(seats: RenderSeat[], oldRow: string, newRow: string): RenderSeat[] {
  const cleanNewRow = newRow.trim().toUpperCase();
  if (!cleanNewRow) return seats;

  return seats.map((s) => {
    if (s.row !== oldRow) return s;
    return {
      ...s,
      row: cleanNewRow,
      label: s.type === "WALKWAY" ? "" : `${cleanNewRow}${s.col}`,
    };
  });
}

export function shiftRowPosition(
  seats: RenderSeat[],
  rowLabel: string,
  deltaX: number,
  deltaY: number,
): RenderSeat[] {
  return seats.map((s) => {
    if (s.row !== rowLabel) return s;
    return {
      ...s,
      x: Math.max(10, s.x + deltaX),
      y: Math.max(10, s.y + deltaY),
    };
  });
}

export function setRowCategory(
  seats: RenderSeat[],
  rowLabel: string,
  category: SeatCategory,
  price?: number,
): RenderSeat[] {
  return seats.map((s) => {
    if (s.row !== rowLabel) return s;
    const seatType: SeatItem["type"] =
      category === "ACCESSIBLE"
        ? "WHEELCHAIR"
        : category === "RECLINER"
          ? "RECLINER"
          : category === "COUPLE"
            ? "COUPLE_LEFT"
            : "STANDARD";

    return {
      ...s,
      category,
      type: s.type === "WALKWAY" ? "WALKWAY" : seatType,
      basePrice: price ?? s.basePrice,
    };
  });
}

export function insertAisleAtColumn(
  seats: RenderSeat[],
  atCol: number,
  targetRow?: string,
): RenderSeat[] {
  return seats.map((s) => {
    if (targetRow && s.row !== targetRow) return s;
    if (s.col >= atCol) {
      return {
        ...s,
        col: s.col + 1,
        label: s.type === "WALKWAY" ? "" : `${s.row}${s.col + 1}`,
        x: s.x + 36,
      };
    }
    return s;
  });
}

export function generateAuditoriumTemplate(
  templateType: "IMAX_CURVED" | "VIP_RECLINER" | "STANDARD_MULTIPLEX" | "BALCONY_AUDITORIUM",
  prices: Partial<Record<SeatCategory, number>> = {},
): RenderSeat[] {
  const result: RenderSeat[] = [];

  if (templateType === "IMAX_CURVED") {
    // 8 rows (A-H), curved arc
    const rowSpecs: { row: string; count: number; cat: SeatCategory }[] = [
      { row: "A", count: 12, cat: "RECLINER" },
      { row: "B", count: 14, cat: "PLATINUM" },
      { row: "C", count: 14, cat: "PLATINUM" },
      { row: "D", count: 16, cat: "GOLD" },
      { row: "E", count: 16, cat: "GOLD" },
      { row: "F", count: 16, cat: "GOLD" },
      { row: "G", count: 14, cat: "SILVER" },
      { row: "H", count: 14, cat: "SILVER" },
    ];

    rowSpecs.forEach((spec, rIdx) => {
      const y = 80 + rIdx * 48;
      const midCol = (spec.count + 1) / 2;
      for (let col = 1; col <= spec.count; col++) {
        // Curve offset
        const offsetFromCenter = col - midCol;
        const curveY = Math.pow(offsetFromCenter, 2) * 1.2;
        const seatId = `tpl-imax-${spec.row}-${col}-${Date.now()}`;
        const basePrice = prices[spec.cat] ?? 400;

        result.push({
          id: seatId,
          row: spec.row,
          col,
          label: `${spec.row}${col}`,
          category: spec.cat,
          basePrice,
          status: "AVAILABLE",
          type: spec.cat === "RECLINER" ? "RECLINER" : "STANDARD",
          x: 40 + (col - 1) * 38,
          y: Math.round(y + curveY),
          width: 30,
          height: 30,
          rotation: Math.round(offsetFromCenter * -1.5),
          source: "LOCAL",
        });
      }
    });
  } else if (templateType === "VIP_RECLINER") {
    // 4 rows of luxurious lounge seats
    const rowSpecs: { row: string; count: number; cat: SeatCategory }[] = [
      { row: "V1", count: 8, cat: "VIP" },
      { row: "V2", count: 8, cat: "RECLINER" },
      { row: "V3", count: 8, cat: "COUPLE" },
      { row: "V4", count: 8, cat: "VIP" },
    ];

    rowSpecs.forEach((spec, rIdx) => {
      const y = 90 + rIdx * 56;
      for (let col = 1; col <= spec.count; col++) {
        // Create walkway after col 4
        const aisleGap = col > 4 ? 40 : 0;
        const seatId = `tpl-vip-${spec.row}-${col}-${Date.now()}`;
        const basePrice = prices[spec.cat] ?? 850;

        result.push({
          id: seatId,
          row: spec.row,
          col,
          label: `${spec.row}${col}`,
          category: spec.cat,
          basePrice,
          status: "AVAILABLE",
          type: spec.cat === "RECLINER" ? "RECLINER" : spec.cat === "COUPLE" ? "COUPLE_LEFT" : "STANDARD",
          x: 60 + (col - 1) * 44 + aisleGap,
          y,
          width: 34,
          height: 34,
          rotation: 0,
          source: "LOCAL",
        });
      }
    });
  } else if (templateType === "BALCONY_AUDITORIUM") {
    // Balcony + Stalls
    const rowSpecs: { row: string; count: number; cat: SeatCategory }[] = [
      { row: "BAL-A", count: 12, cat: "PLATINUM" },
      { row: "BAL-B", count: 12, cat: "PLATINUM" },
      { row: "ST-A", count: 14, cat: "GOLD" },
      { row: "ST-B", count: 14, cat: "GOLD" },
      { row: "ST-C", count: 14, cat: "SILVER" },
      { row: "ST-D", count: 14, cat: "SILVER" },
    ];

    rowSpecs.forEach((spec, rIdx) => {
      // Extra vertical gap after Balcony rows
      const y = 80 + rIdx * 48 + (rIdx >= 2 ? 30 : 0);
      for (let col = 1; col <= spec.count; col++) {
        const aisleGap = col > 7 ? 30 : 0;
        const seatId = `tpl-bal-${spec.row}-${col}-${Date.now()}`;
        const basePrice = prices[spec.cat] ?? 380;

        result.push({
          id: seatId,
          row: spec.row,
          col,
          label: `${spec.row}${col}`,
          category: spec.cat,
          basePrice,
          status: "AVAILABLE",
          type: "STANDARD",
          x: 40 + (col - 1) * 36 + aisleGap,
          y,
          width: 30,
          height: 30,
          rotation: 0,
          source: "LOCAL",
        });
      }
    });
  } else {
    // STANDARD_MULTIPLEX (default 10 rows x 12 cols with center walkway)
    const rowsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    rowsList.forEach((row, rIdx) => {
      const y = 70 + rIdx * 46;
      const cat: SeatCategory = rIdx < 2 ? "PLATINUM" : rIdx < 6 ? "GOLD" : "SILVER";
      for (let col = 1; col <= 12; col++) {
        const centerAisle = col > 6 ? 36 : 0;
        const seatId = `tpl-std-${row}-${col}-${Date.now()}`;
        const basePrice = prices[cat] ?? 320;

        result.push({
          id: seatId,
          row,
          col,
          label: `${row}${col}`,
          category: cat,
          basePrice,
          status: "AVAILABLE",
          type: "STANDARD",
          x: 40 + (col - 1) * 36 + centerAisle,
          y,
          width: 30,
          height: 30,
          rotation: 0,
          source: "LOCAL",
        });
      }
    });
  }

  return result;
}

export function rotateSelectedSeats(
  seats: RenderSeat[],
  selectedIds: Set<string>,
  angleDelta = 90,
): RenderSeat[] {
  return seats.map((s) => {
    if (!selectedIds.has(s.id)) return s;
    const newRotation = (s.rotation + angleDelta) % 360;
    return {
      ...s,
      rotation: newRotation,
    };
  });
}

export function alignSeats(
  seats: RenderSeat[],
  selectedIds: Set<string>,
  alignType: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "HORIZONTAL_CENTER" | "VERTICAL_CENTER",
): RenderSeat[] {
  const selectedSeats = seats.filter((s) => selectedIds.has(s.id));
  if (selectedSeats.length < 2) return seats;

  const minX = Math.min(...selectedSeats.map((s) => s.x));
  const maxX = Math.max(...selectedSeats.map((s) => s.x));
  const minY = Math.min(...selectedSeats.map((s) => s.y));
  const maxY = Math.max(...selectedSeats.map((s) => s.y));
  const avgY = Math.round(selectedSeats.reduce((sum, s) => sum + s.y, 0) / selectedSeats.length);
  const avgX = Math.round(selectedSeats.reduce((sum, s) => sum + s.x, 0) / selectedSeats.length);

  return seats.map((s) => {
    if (!selectedIds.has(s.id)) return s;

    let targetX = s.x;
    let targetY = s.y;

    if (alignType === "LEFT") targetX = minX;
    else if (alignType === "RIGHT") targetX = maxX;
    else if (alignType === "TOP") targetY = minY;
    else if (alignType === "BOTTOM") targetY = maxY;
    else if (alignType === "HORIZONTAL_CENTER") targetY = avgY;
    else if (alignType === "VERTICAL_CENTER") targetX = avgX;

    return {
      ...s,
      x: targetX,
      y: targetY,
    };
  });
}

export function batchGenerateGrid(
  startRowChar = "A",
  rowCount = 10,
  seatsPerRow = 12,
  prices: Partial<Record<SeatCategory, number>> = {},
  aisleCols: number[] = [6],
): RenderSeat[] {
  const result: RenderSeat[] = [];
  const startCharCode = startRowChar.toUpperCase().charCodeAt(0);

  for (let r = 0; r < rowCount; r++) {
    const rowLabel = String.fromCharCode(startCharCode + r);
    const y = 80 + r * 46;

    let cat: SeatCategory = "SILVER";
    if (r === 0) cat = "RECLINER";
    else if (r < 3) cat = "PLATINUM";
    else if (r < 6) cat = "GOLD";

    let currentX = 50;

    for (let col = 1; col <= seatsPerRow; col++) {
      const seatId = `batch-${rowLabel}-${col}-${Date.now()}-${col}`;
      const basePrice = prices[cat] ?? 350;

      result.push({
        id: seatId,
        row: rowLabel,
        col,
        label: `${rowLabel}${col}`,
        category: cat,
        basePrice,
        status: "AVAILABLE",
        type: cat === "RECLINER" ? "RECLINER" : "STANDARD",
        x: currentX,
        y,
        width: 30,
        height: 30,
        rotation: 0,
        source: "LOCAL",
      });

      currentX += 36;
      if (aisleCols.includes(col)) {
        currentX += 36; // Aisle gap
      }
    }
  }

  return result;
}




