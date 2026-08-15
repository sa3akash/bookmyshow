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
  venueId: string;
  name: string;
  supportedFormats?: string[];
  rows: Array<{
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
    let targetVenueId = dto.venueId;

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

    let totalSeats = 0;
    for (const r of dto.rows) {
      totalSeats += r.seatsCount;
    }

    return await db.transaction(async (tx) => {
      let screen: typeof venueScreens.$inferSelect | undefined;

      if (dto.screenId) {
        screen = await tx.query.venueScreens.findFirst({
          where: eq(venueScreens.id, dto.screenId),
        });
      }

      if (!screen) {
        screen = await tx.query.venueScreens.findFirst({
          where: and(eq(venueScreens.venueId, targetVenueId), eq(venueScreens.name, dto.name)),
        });
      }

      if (screen) {
        const [updatedScreen] = await tx
          .update(venueScreens)
          .set({
            name: dto.name,
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
            name: dto.name,
            supportedFormats: dto.supportedFormats || ["2D", "3D", "IMAX", "4DX", "DOLBY", "VIP", "PREMIUM"],
            totalSeats,
          })
          .returning();
        screen = insertedScreen!;
      }

      if (!screen) {
        throw new Error("Failed to create or update venue screen");
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
        metadata: Record<string, unknown>;
      }> = [];

      let yPos = 0;
      for (const row of dto.rows) {
        yPos += 40; // Layout coordinate spacing
        for (let col = 1; col <= row.seatsCount; col++) {
          seatsToInsert.push({
            screenId: screen.id,
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
            metadata: row.metadata || {},
          });
        }
      }

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
              isActive: true,
              metadata: sql`excluded.metadata`,
            },
          });
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
}

export const venueService = new VenueService();
