import { db } from "@/infrastructure/database/client";
import { shows, seats, seatLocks, bookingSeats, bookings, venueScreens, venues, movies } from "@/infrastructure/database/schema";
import { eq, and, gte, lte, or, inArray } from "drizzle-orm";
import { ConflictError, NotFoundError } from "@/core/errors/app-error";

export interface CreateShowDTO {
  movieId: string;
  screenId: string;
  startTime: Date;
  endTime: Date;
  language: string;
  format: string;
  basePriceMinor: number;
}

export class ShowService {
  async createShow(dto: CreateShowDTO) {
    if (dto.startTime >= dto.endTime) {
      throw new Error("Show start time must be before end time");
    }

    // Check screen existence
    const screen = await db.query.venueScreens.findFirst({
      where: eq(venueScreens.id, dto.screenId),
    });
    if (!screen) {
      throw new NotFoundError(`Screen ${dto.screenId} not found`);
    }

    // Check movie existence
    const movie = await db.query.movies.findFirst({
      where: eq(movies.id, dto.movieId),
    });
    if (!movie) {
      throw new NotFoundError(`Movie ${dto.movieId} not found`);
    }

    // Transactional overlap check
    return await db.transaction(async (tx) => {
      const overlapping = await tx.query.shows.findFirst({
        where: and(
          eq(shows.screenId, dto.screenId),
          eq(shows.status, "SCHEDULED"),
          or(
            and(gte(shows.startTime, dto.startTime), lte(shows.startTime, dto.endTime)),
            and(gte(shows.endTime, dto.startTime), lte(shows.endTime, dto.endTime)),
            and(lte(shows.startTime, dto.startTime), gte(shows.endTime, dto.endTime))
          )
        ),
      });

      if (overlapping) {
        throw new ConflictError("Overlapping show exists on this screen during the requested time window");
      }

      const [inserted] = await tx
        .insert(shows)
        .values({
          movieId: dto.movieId,
          screenId: dto.screenId,
          startTime: dto.startTime,
          endTime: dto.endTime,
          language: dto.language,
          format: dto.format,
          basePriceMinor: dto.basePriceMinor,
        })
        .returning();

      return inserted;
    });
  }

  async getShowsForMovie(movieId: string, cityId?: string) {
    const now = new Date();
    const query = db
      .select({
        show: shows,
        screen: venueScreens,
        venue: venues,
      })
      .from(shows)
      .innerJoin(venueScreens, eq(shows.screenId, venueScreens.id))
      .innerJoin(venues, eq(venueScreens.venueId, venues.id))
      .where(
        and(
          eq(shows.movieId, movieId),
          eq(shows.status, "SCHEDULED"),
          gte(shows.startTime, now),
          cityId ? eq(venues.cityId, cityId) : undefined
        )
      );

    return await query;
  }

  async getShowSeatMap(showId: string) {
    const show = await db.query.shows.findFirst({
      where: eq(shows.id, showId),
    });

    if (!show) {
      throw new NotFoundError(`Show with ID ${showId} not found`);
    }

    // Fetch all seats for the screen
    const allSeats = await db.query.seats.findMany({
      where: and(eq(seats.screenId, show.screenId), eq(seats.isActive, true)),
    });

    // Fetch active held locks for this show
    const now = new Date();
    const activeLocks = await db.query.seatLocks.findMany({
      where: and(
        eq(seatLocks.showId, showId),
        eq(seatLocks.status, "HELD"),
        gte(seatLocks.expiresAt, now)
      ),
    });
    const heldSeatIds = new Set(activeLocks.map((l) => l.seatId));

    // Fetch confirmed booked seats for this show
    const confirmedBookings = await db
      .select({ seatId: bookingSeats.seatId })
      .from(bookingSeats)
      .innerJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
      .where(
        and(
          eq(bookings.showId, showId),
          inArray(bookings.status, ["CONFIRMED", "TICKET_ISSUED", "PAYMENT_PENDING"])
        )
      );

    const bookedSeatIds = new Set(confirmedBookings.map((b) => b.seatId));

    // Map seat layout with dynamic pricing and availability status
    return {
      showId: show.id,
      basePriceMinor: show.basePriceMinor,
      seats: allSeats.map((s) => {
        let status: "AVAILABLE" | "HELD" | "BOOKED" = "AVAILABLE";
        if (bookedSeatIds.has(s.id)) {
          status = "BOOKED";
        } else if (heldSeatIds.has(s.id)) {
          status = "HELD";
        }

        const seatPriceMinor = Math.round(show.basePriceMinor * parseFloat(s.priceMultiplier));

        return {
          id: s.id,
          seatNumber: s.seatNumber,
          rowLabel: s.rowLabel,
          columnNumber: s.columnNumber,
          type: s.type,
          category: s.category,
          priceMinor: seatPriceMinor,
          status,
          layout: { x: s.x, y: s.y },
        };
      }),
    };
  }
}

export const showService = new ShowService();
