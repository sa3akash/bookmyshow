import { db } from "@/infrastructure/database/client";
import { cities, venues, venueScreens, seats } from "@/infrastructure/database/schema";
import { eq, and, sql } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";

export interface CreateCityDTO {
  name: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}

export interface CreateVenueDTO {
  cityId: string;
  name: string;
  address: string;
  latitude?: string;
  longitude?: string;
  amenities?: string[];
}

export interface CreateScreenLayoutDTO {
  screenId?: string;
  venueId?: string;
  name?: string;
  supportedFormats?: string[];
  totalSeats?: number;
  rows?: Array<{
    rowLabel: string;
    seatsCount: number;
    type?: string; // REGULAR, PREMIUM, VIP, RECLINER, COUPLE, ACCESSIBLE, WHEELCHAIR, SOFA, BALCONY, BOX
    category?: string;
    priceMultiplier?: string;
    width?: number;
    height?: number;
    rotation?: number;
    metadata?: Record<string, unknown>;
  }>;
  seats?: Array<{
    id?: string;
    rowLabel: string;
    columnNumber: number;
    seatNumber?: string;
    type?: string;
    category?: string;
    priceMultiplier?: string | number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }>;
}

export class VenueService {
  async listCities() {
    return await db.query.cities.findMany({
      where: eq(cities.isActive, true),
    });
  }

  async createCity(dto: CreateCityDTO) {
    const [inserted] = await db.insert(cities).values(dto).returning();
    return inserted;
  }

  async listVenuesByCity(cityId: string) {
    return await db.query.venues.findMany({
      where: and(eq(venues.cityId, cityId), eq(venues.isActive, true)),
      with: {
        screens: true,
      },
    });
  }

  async createVenue(dto: CreateVenueDTO) {
    const [inserted] = await db.insert(venues).values(dto).returning();
    return inserted;
  }

  async getScreenLayout(screenId: string) {
    const screen = await db.query.venueScreens.findFirst({
      where: eq(venueScreens.id, screenId),
    });

    if (!screen) {
      throw new NotFoundError("Screen not found");
    }

    const seatsList = await db.query.seats.findMany({
      where: and(eq(seats.screenId, screenId), eq(seats.isActive, true)),
    });

    return {
      screen,
      seats: seatsList,
    };
  }

  async createScreenWithLayout(dto: CreateScreenLayoutDTO) {
    let targetVenueId = dto.venueId || "";

    if (dto.screenId && !targetVenueId) {
      const existingScreen = await db.query.venueScreens.findFirst({
        where: eq(venueScreens.id, dto.screenId),
      });
      if (existingScreen) {
        targetVenueId = existingScreen.venueId;
      }
    }

    if (targetVenueId) {
      const existingVenue = await db.query.venues.findFirst({
        where: eq(venues.id, targetVenueId),
      });

      if (!existingVenue) {
        const firstVenue = await db.query.venues.findFirst({
          where: eq(venues.isActive, true),
        });
        if (firstVenue) {
          targetVenueId = firstVenue.id;
        }
      }
    } else {
      const firstVenue = await db.query.venues.findFirst({
        where: eq(venues.isActive, true),
      });
      if (firstVenue) {
        targetVenueId = firstVenue.id;
      }
    }

    const seatsToInsert: Array<{
      screenId: string;
      rowLabel: string;
      columnNumber: number;
      seatNumber: string;
      type: string;
      category: string;
      priceMultiplier: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      isActive: boolean;
      metadata: Record<string, unknown>;
    }> = [];

    if (dto.seats && dto.seats.length > 0) {
      for (const seat of dto.seats) {
        seatsToInsert.push({
          screenId: "", // filled inside transaction after screen resolved
          rowLabel: seat.rowLabel,
          columnNumber: seat.columnNumber,
          seatNumber: seat.seatNumber || `${seat.rowLabel}${seat.columnNumber}`,
          type: seat.type || "REGULAR",
          category: seat.category || "Standard",
          priceMultiplier: String(seat.priceMultiplier ?? "1.00"),
          x: Math.round(Number(seat.x ?? 0)),
          y: Math.round(Number(seat.y ?? 0)),
          width: Math.round(Number(seat.width ?? 30)),
          height: Math.round(Number(seat.height ?? 30)),
          rotation: Math.round(Number(seat.rotation ?? 0)),
          isActive: seat.isActive !== false,
          metadata: seat.metadata || {},
        });
      }
    } else if (dto.rows && dto.rows.length > 0) {
      let yPos = 0;
      for (const row of dto.rows) {
        yPos += 40; // Layout coordinate spacing
        for (let col = 1; col <= row.seatsCount; col++) {
          seatsToInsert.push({
            screenId: "",
            rowLabel: row.rowLabel,
            columnNumber: col,
            seatNumber: `${row.rowLabel}${col}`,
            type: row.type || "REGULAR",
            category: row.category || "Standard",
            priceMultiplier: row.priceMultiplier || "1.00",
            x: col * 35,
            y: yPos,
            width: row.width || 30,
            height: row.height || 30,
            rotation: row.rotation || 0,
            isActive: true,
            metadata: row.metadata || {},
          });
        }
      }
    }

    const totalSeats = seatsToInsert.filter(
      (s) => s.type !== "WALKWAY" && s.isActive,
    ).length;

    return await db.transaction(async (tx) => {
      let screen: typeof venueScreens.$inferSelect | undefined;

      if (dto.screenId) {
        screen = await tx.query.venueScreens.findFirst({
          where: eq(venueScreens.id, dto.screenId),
        });
      }

      if (!screen && dto.name) {
        screen = await tx.query.venueScreens.findFirst({
          where: and(
            eq(venueScreens.venueId, targetVenueId),
            eq(venueScreens.name, dto.name),
          ),
        });
      }

      if (screen) {
        const [updatedScreen] = await tx
          .update(venueScreens)
          .set({
            name: dto.name || screen.name,
            totalSeats,
            supportedFormats: dto.supportedFormats || screen.supportedFormats,
          })
          .where(eq(venueScreens.id, screen.id))
          .returning();
        screen = updatedScreen!;
      } else {
        const [insertedScreen] = await tx
          .insert(venueScreens)
          .values({
            venueId: targetVenueId,
            name: dto.name || "Main Screen",
            supportedFormats: dto.supportedFormats || [
              "2D",
              "3D",
              "IMAX",
              "4DX",
              "DOLBY",
              "VIP",
              "PREMIUM",
            ],
            totalSeats,
          })
          .returning();
        screen = insertedScreen!;
      }

      if (!screen) {
        throw new Error("Failed to create or update venue screen");
      }

      const activeSeatNumbers = new Set<string>();
      for (const item of seatsToInsert) {
        item.screenId = screen.id;
        activeSeatNumbers.add(item.seatNumber);
      }

      // Upsert seats in chunks
      const CHUNK_SIZE = 50;
      for (let i = 0; i < seatsToInsert.length; i += CHUNK_SIZE) {
        const chunk = seatsToInsert.slice(i, i + CHUNK_SIZE);
        await tx
          .insert(seats)
          .values(chunk)
          .onConflictDoUpdate({
            target: [seats.screenId, seats.seatNumber],
            set: {
              rowLabel: sql`excluded.row_label`,
              columnNumber: sql`excluded.column_number`,
              type: sql`excluded.type`,
              category: sql`excluded.category`,
              priceMultiplier: sql`excluded.price_multiplier`,
              x: sql`excluded.x`,
              y: sql`excluded.y`,
              width: sql`excluded.width`,
              height: sql`excluded.height`,
              rotation: sql`excluded.rotation`,
              isActive: sql`excluded.is_active`,
              metadata: sql`excluded.metadata`,
            },
          });
      }

      // Soft-delete/deactivate any existing seats for this screen that are no longer in the payload
      if (dto.seats) {
        const currentDbSeats = await tx.query.seats.findMany({
          where: eq(seats.screenId, screen.id),
        });

        for (const s of currentDbSeats) {
          if (!activeSeatNumbers.has(s.seatNumber) && s.isActive) {
            await tx
              .update(seats)
              .set({ isActive: false })
              .where(eq(seats.id, s.id));
          }
        }
      }

      return {
        screen,
        totalSeatsCreated: seatsToInsert.length,
      };
    });
  }

  async updateVenue(id: string, dto: Partial<CreateVenueDTO> & { isActive?: boolean }) {
    const [updated] = await db
      .update(venues)
      .set(dto)
      .where(eq(venues.id, id))
      .returning();
    if (!updated) throw new NotFoundError("Venue not found");
    return updated;
  }

  async deleteVenue(id: string) {
    const [deleted] = await db
      .update(venues)
      .set({ isActive: false })
      .where(eq(venues.id, id))
      .returning();
    if (!deleted) throw new NotFoundError("Venue not found");
    return { success: true, id };
  }

  async updateScreen(id: string, dto: { name?: string; supportedFormats?: string[]; totalSeats?: number; isActive?: boolean }) {
    const [updated] = await db
      .update(venueScreens)
      .set(dto)
      .where(eq(venueScreens.id, id))
      .returning();
    if (!updated) throw new NotFoundError("Screen not found");
    return updated;
  }

  async deleteScreen(id: string) {
    const [deleted] = await db
      .update(venueScreens)
      .set({ isActive: false })
      .where(eq(venueScreens.id, id))
      .returning();
    if (!deleted) throw new NotFoundError("Screen not found");
    return { success: true, id };
  }

  async getSeatLayout(screenId: string) {
    const seat = await db.query.seats.findMany({
      where: eq(seats.screenId, screenId),
    });
    return seat;
  }


}

export const venueService = new VenueService();
