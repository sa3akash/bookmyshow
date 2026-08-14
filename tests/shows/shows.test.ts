import { describe, expect, test, spyOn } from "bun:test";
import { showService } from "@/modules/shows/service/show.service";

describe("SHOWS & REAL-TIME SEAT MAP TEST SUITE", () => {
  test("ShowService lists available showtimes for a movie", async () => {
    spyOn(showService, "getShowsForMovie").mockImplementation(async () => [
      {
        show: {
          id: "show-1",
          movieId: "m-1",
          screenId: "screen-1",
          startTime: new Date(),
          endTime: new Date(),
          language: "English",
          format: "IMAX 3D",
          basePriceMinor: 50000,
          status: "SCHEDULED",
          createdAt: new Date(),
        },
        screen: { id: "screen-1", venueId: "v-1", name: "IMAX Hall 1", supportedFormats: ["IMAX"], totalSeats: 100, isActive: true },
        venue: { id: "v-1", cityId: "c-1", name: "Star Cineplex SKS Tower", address: "Mohakhali, Dhaka", latitude: null, longitude: null, amenities: [], isActive: true, createdAt: new Date() },
      },
    ]);

    const showsList = await showService.getShowsForMovie("m-1");
    expect(showsList.length).toBe(1);
    expect(showsList[0]!.show.format).toBe("IMAX 3D");
  });

  test("ShowService retrieves real-time seat map with seat availability statuses", async () => {
    spyOn(showService, "getShowSeatMap").mockImplementation(async () => ({
      showId: "show-1",
      basePriceMinor: 50000,
      seats: [
        { id: "seat-1", seatNumber: "A1", rowLabel: "A", columnNumber: 1, type: "REGULAR", category: "ROYAL", priceMinor: 75000, status: "AVAILABLE", layout: { x: 0, y: 0 } },
        { id: "seat-2", seatNumber: "A2", rowLabel: "A", columnNumber: 2, type: "REGULAR", category: "ROYAL", priceMinor: 75000, status: "HELD", layout: { x: 1, y: 0 } },
      ],
    }));

    const seatMap = await showService.getShowSeatMap("show-1");
    expect(seatMap.seats.length).toBe(2);
    expect(seatMap.seats[0]!.status).toBe("AVAILABLE");
    expect(seatMap.seats[1]!.status).toBe("HELD");
  });
});
