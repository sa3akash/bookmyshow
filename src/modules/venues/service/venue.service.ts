import { db } from "@/infrastructure/database/client";
import { cities, venues, venueScreens, seats } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";

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

  async createScreenWithLayout(dto: CreateScreenLayoutDTO) {
    let totalSeats = 0;
    for (const r of dto.rows) {
      totalSeats += r.seatsCount;
    }

    return await db.transaction(async (tx) => {
      const [screen] = await tx
        .insert(venueScreens)
        .values({
          venueId: dto.venueId,
          name: dto.name,
          supportedFormats: dto.supportedFormats || ["2D", "3D", "IMAX", "4DX", "DOLBY", "VIP", "PREMIUM"],
          totalSeats,
        })
        .returning();

      if (!screen) {
        throw new Error("Failed to create venue screen");
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

      await tx.insert(seats).values(seatsToInsert);

      return {
        screen,
        totalSeatsCreated: seatsToInsert.length,
      };
    });
  }
}

export const venueService = new VenueService();
