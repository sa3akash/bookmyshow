import { db } from "@/infrastructure/database/client";
import { events, eventPerformers, eventSlots } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { NotFoundError } from "@/core/errors/app-error";

export class EventService {
  async listEvents(category?: string, cityId?: string) {
    const conditions = [];
    if (category) {
      conditions.push(eq(events.category, category.toUpperCase()));
    }
    if (cityId) {
      conditions.push(eq(events.cityId, cityId));
    }

    return await db.query.events.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    });
  }

  async getEventDetails(eventId: string) {
    const eventRecord = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!eventRecord) {
      throw new NotFoundError(`Event ${eventId} not found`);
    }

    const performers = await db.query.eventPerformers.findMany({
      where: eq(eventPerformers.eventId, eventId),
    });

    const slots = await db.query.eventSlots.findMany({
      where: eq(eventSlots.eventId, eventId),
      orderBy: (s, { asc }) => [asc(s.startTime)],
    });

    return {
      ...eventRecord,
      performers,
      slots: slots.map((s) => ({
        ...s,
        priceBDT: s.priceMinor / 100,
      })),
    };
  }

  async createEvent(data: {
    cityId?: string;
    title: string;
    description?: string;
    category: "CONCERT" | "COMEDY" | "SPORTS" | "THEATRE" | "WORKSHOP";
    venueName: string;
    address?: string;
    bannerUrl?: string;
    posterUrl?: string;
    performers?: Array<{ name: string; role?: string; imageUrl?: string }>;
    slots?: Array<{ startTime: Date; endTime: Date; tierName: string; priceMinor: number; totalSeats: number }>;
  }) {
    return await db.transaction(async (tx) => {
      const [insertedEvent] = await tx
        .insert(events)
        .values({
          cityId: data.cityId,
          title: data.title,
          description: data.description,
          category: data.category,
          venueName: data.venueName,
          address: data.address,
          bannerUrl: data.bannerUrl,
          posterUrl: data.posterUrl,
          status: "UPCOMING",
        })
        .returning();

      if (data.performers && data.performers.length > 0) {
        await tx.insert(eventPerformers).values(
          data.performers.map((p) => ({
            eventId: insertedEvent!.id,
            name: p.name,
            role: p.role,
            imageUrl: p.imageUrl,
          }))
        );
      }

      if (data.slots && data.slots.length > 0) {
        await tx.insert(eventSlots).values(
          data.slots.map((s) => ({
            eventId: insertedEvent!.id,
            startTime: s.startTime,
            endTime: s.endTime,
            tierName: s.tierName,
            priceMinor: s.priceMinor,
            totalSeats: s.totalSeats,
            availableSeats: s.totalSeats,
          }))
        );
      }

      return insertedEvent!;
    });
  }
}

export const eventService = new EventService();
