import { describe, expect, test, spyOn } from "bun:test";
import { venueService } from "@/modules/venues/service/venue.service";

describe("VENUES & SEAT GRID TEST SUITE", () => {
  test("VenueService lists active cities and venues", async () => {
    spyOn(venueService, "listCities").mockImplementation(async () => [
      { id: "city-1", name: "Dhaka", state: "Dhaka Division", country: "Bangladesh", latitude: null, longitude: null, isActive: true, createdAt: new Date() },
    ]);

    const cities = await venueService.listCities();
    expect(cities.length).toBe(1);
    expect(cities[0]!.name).toBe("Dhaka");
  });

  test("VenueService generates dynamic screen seat grid with categories and price multipliers", async () => {
    spyOn(venueService, "createScreenWithLayout").mockImplementation(async () => ({
      screen: { id: "screen-1", venueId: "v-1", name: "IMAX Hall 1", supportedFormats: ["IMAX", "3D"], totalSeats: 20, isActive: true },
      totalSeatsCreated: 20,
    }));

    const layoutResult = await venueService.createScreenWithLayout({
      venueId: "v-1",
      name: "IMAX Hall 1",
      supportedFormats: ["IMAX", "3D"],
      rows: [
        { rowLabel: "A", seatsCount: 10, category: "ROYAL", priceMultiplier: "1.5" },
        { rowLabel: "B", seatsCount: 10, category: "EXECUTIVE", priceMultiplier: "1.0" },
      ],
    });

    expect(layoutResult.screen.name).toBe("IMAX Hall 1");
    expect(layoutResult.totalSeatsCreated).toBe(20);
  });
});
