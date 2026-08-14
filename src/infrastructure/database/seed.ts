import { db } from "./client";
import {
  users,
  userProfiles,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  cities,
  venues,
  venueScreens,
  seats,
  movies,
  shows,
  coupons,
  wallets,
  offers,
  movieCast,
  movieCrew,
  movieMedia,
  events,
  eventPerformers,
  eventSlots,
} from "./schema";
import { eq } from "drizzle-orm";
import { logger } from "@/core/observability/logger";
import { eventService } from "@/modules/events/event.service";

export async function seedDatabase() {
  logger.info("🌱 Starting expanded database seeding...");

  try {
    // 1. Seed Roles
    logger.info("Seeding roles...");
    const roleDefinitions = [
      { name: "SUPER_ADMIN", description: "Super Administrator with all privileges" },
      { name: "ADMIN", description: "Administrator access" },
      { name: "MOVIE_MANAGER", description: "Manager for movie catalog and show scheduling" },
      { name: "VENUE_MANAGER", description: "Manager for venues and screen layouts" },
      { name: "CUSTOMER", description: "Default customer role" },
    ];

    const insertedRoles: Record<string, string> = {};
    for (const r of roleDefinitions) {
      let existing = await db.query.roles.findFirst({ where: eq(roles.name, r.name) });
      if (!existing) {
        const [inserted] = await db.insert(roles).values(r).returning();
        existing = inserted;
      }
      if (existing) {
        insertedRoles[r.name] = existing.id;
      }
    }

    // 2. Seed Permissions
    logger.info("Seeding permissions...");
    const permDefinitions = [
      { name: "movie:create", description: "Create movies" },
      { name: "movie:update", description: "Update movies" },
      { name: "show:create", description: "Schedule shows" },
      { name: "booking:read", description: "Read booking details" },
      { name: "refund:create", description: "Process refunds" },
      { name: "admin:read", description: "Access admin dashboard" },
    ];

    for (const p of permDefinitions) {
      const existing = await db.query.permissions.findFirst({ where: eq(permissions.name, p.name) });
      if (!existing) {
        const [inserted] = await db.insert(permissions).values(p).returning();
        if (insertedRoles["SUPER_ADMIN"] && inserted) {
          await db.insert(rolePermissions).values({
            roleId: insertedRoles["SUPER_ADMIN"],
            permissionId: inserted.id,
          }).onConflictDoNothing();
        }
        if (insertedRoles["ADMIN"] && inserted) {
          await db.insert(rolePermissions).values({
            roleId: insertedRoles["ADMIN"],
            permissionId: inserted.id,
          }).onConflictDoNothing();
        }
      }
    }

    // 3. Seed Users (Admin, Managers, Customers)
    logger.info("Seeding system users and test customer accounts...");
    const defaultPasswordHash = await Bun.password.hash("Pass1234!", { algorithm: "bcrypt", cost: 10 });

    const userSeedData = [
      { email: "admin@bookmyshow.com", fullName: "System Admin", role: "SUPER_ADMIN", phone: "+8801700000000" },
      { email: "manager.movie@bookmyshow.com", fullName: "Movie Content Manager", role: "MOVIE_MANAGER", phone: "+8801700000001" },
      { email: "manager.venue@bookmyshow.com", fullName: "Venue Manager", role: "VENUE_MANAGER", phone: "+8801700000002" },
      { email: "john.doe@gmail.com", fullName: "John Doe", role: "CUSTOMER", phone: "+8801811111111" },
      { email: "sarah.khan@yahoo.com", fullName: "Sarah Khan", role: "CUSTOMER", phone: "+8801822222222" },
      { email: "rakib.hassan@gmail.com", fullName: "Rakib Hassan", role: "CUSTOMER", phone: "+8801833333333" },
    ];

    for (const u of userSeedData) {
      let userRecord = await db.query.users.findFirst({ where: eq(users.email, u.email) });
      if (!userRecord) {
        const [inserted] = await db
          .insert(users)
          .values({
            email: u.email,
            fullName: u.fullName,
            phone: u.phone,
            passwordHash: defaultPasswordHash,
          })
          .returning();
        userRecord = inserted!;

        await db.insert(userProfiles).values({ userId: userRecord.id, city: "Dhaka" });
        if (insertedRoles[u.role]) {
          await db.insert(userRoles).values({ userId: userRecord.id, roleId: insertedRoles[u.role]! });
        }

        // Initialize digital wallet with 2,000 BDT minor units (200000 minor units) for customers
        if (u.role === "CUSTOMER") {
          await db.insert(wallets).values({
            userId: userRecord.id,
            balanceMinor: 200000,
            currency: "BDT",
          }).onConflictDoNothing();
        }
      }
    }

    // 4. Seed Expanded Cities
    logger.info("Seeding expanded cities...");
    const cityList = [
      { name: "Dhaka", state: "Dhaka Division", country: "Bangladesh", latitude: "23.8103", longitude: "90.4125" },
      { name: "Chittagong", state: "Chittagong Division", country: "Bangladesh", latitude: "22.3569", longitude: "91.7832" },
      { name: "Sylhet", state: "Sylhet Division", country: "Bangladesh", latitude: "24.8949", longitude: "91.8687" },
      { name: "Rajshahi", state: "Rajshahi Division", country: "Bangladesh", latitude: "24.3745", longitude: "88.6042" },
      { name: "Khulna", state: "Khulna Division", country: "Bangladesh", latitude: "22.8456", longitude: "89.5403" },
      { name: "Comilla", state: "Chittagong Division", country: "Bangladesh", latitude: "23.4607", longitude: "91.1809" },
    ];

    const insertedCities: Record<string, string> = {};
    for (const c of cityList) {
      let existing = await db.query.cities.findFirst({ where: eq(cities.name, c.name) });
      if (!existing) {
        const [inserted] = await db.insert(cities).values(c).returning();
        existing = inserted;
      }
      if (existing) {
        insertedCities[c.name] = existing.id;
      }
    }

    // 5. Seed Venues, Screens & Layouts
    logger.info("Seeding venues, screens, and detailed seat grids...");
    const venueList = [
      {
        city: "Dhaka",
        name: "Star Cineplex - Bashundhara City",
        address: "Level 8, Bashundhara City Shopping Mall, Panthapath, Dhaka",
        amenities: ["IMAX 3D", "Dolby Atmos", "Recliners", "Food Court", "Parking"],
        screens: [
          { name: "Hall 1 (IMAX 3D)", formats: ["2D", "3D", "IMAX"], totalSeats: 40 },
          { name: "Hall 2 (Dolby Atmos)", formats: ["2D", "3D"], totalSeats: 30 },
        ],
      },
      {
        city: "Dhaka",
        name: "Blockbuster Cinemas - Jamuna Future Park",
        address: "Level 5, Jamuna Future Park, Ka-244 Pragati Sarani, Dhaka",
        amenities: ["4DX", "Dolby Digital", "VIP Lounge", "Valet Parking"],
        screens: [
          { name: "Cinema 1 (4DX Extreme)", formats: ["2D", "3D", "4DX"], totalSeats: 30 },
          { name: "Cinema 2 (VIP Recliner)", formats: ["2D", "VIP"], totalSeats: 20 },
        ],
      },
      {
        city: "Dhaka",
        name: "Star Cineplex - Sony Square Mirpur",
        address: "Plot 1, Block D, Section 2, Mirpur, Dhaka",
        amenities: ["Dolby Atmos", "Recliners", "Snack Bar"],
        screens: [
          { name: "Screen 1 (Atmos)", formats: ["2D", "3D"], totalSeats: 30 },
        ],
      },
      {
        city: "Chittagong",
        name: "Silver Screen Cineplex",
        address: "Finlay Square, 2nd Floor, CDA Avenue, Chittagong",
        amenities: ["Platinum Suite", "Dolby Atmos", "Gourmet Dining"],
        screens: [
          { name: "Platinum Hall", formats: ["2D", "3D", "VIP"], totalSeats: 30 },
        ],
      },
      {
        city: "Sylhet",
        name: "Grand Sylhet Cineplex",
        address: "Boro Bazar Road, Sylhet",
        amenities: ["HD Projection", "Food Court", "Air Conditioned"],
        screens: [
          { name: "Main Hall", formats: ["2D", "3D"], totalSeats: 30 },
        ],
      },
    ];

    const screenMap: Record<string, string> = {}; // venueName -> screenId

    for (const vData of venueList) {
      const cityId = insertedCities[vData.city];
      if (!cityId) continue;

      let venueObj = await db.query.venues.findFirst({ where: eq(venues.name, vData.name) });
      if (!venueObj) {
        const [insertedVenue] = await db
          .insert(venues)
          .values({
            cityId,
            name: vData.name,
            address: vData.address,
            amenities: vData.amenities,
          })
          .returning();
        venueObj = insertedVenue!;

        for (const sData of vData.screens) {
          const [insertedScreen] = await db
            .insert(venueScreens)
            .values({
              venueId: venueObj.id,
              name: sData.name,
              supportedFormats: sData.formats,
              totalSeats: sData.totalSeats,
            })
            .returning();

          screenMap[`${vData.name}:${sData.name}`] = insertedScreen!.id;

          // Build Seat Layout Grid
          const seatRecords: Array<{
            screenId: string;
            rowLabel: string;
            columnNumber: number;
            seatNumber: string;
            type: string;
            category: string;
            priceMultiplier: string;
            x: number;
            y: number;
          }> = [];

          const rows = [
            { rowLabel: "A", seatsCount: 10, type: "Regular", category: "Standard", priceMultiplier: "1.00" },
            { rowLabel: "B", seatsCount: 10, type: "Regular", category: "Standard", priceMultiplier: "1.00" },
            { rowLabel: "C", seatsCount: 10, type: "VIP", category: "Premium", priceMultiplier: "1.50" },
          ];

          if (sData.totalSeats >= 40) {
            rows.push({ rowLabel: "D", seatsCount: 10, type: "Recliner", category: "VIP", priceMultiplier: "2.00" });
          }

          let y = 40;
          for (const row of rows) {
            for (let col = 1; col <= row.seatsCount; col++) {
              seatRecords.push({
                screenId: insertedScreen!.id,
                rowLabel: row.rowLabel,
                columnNumber: col,
                seatNumber: `${row.rowLabel}${col}`,
                type: row.type,
                category: row.category,
                priceMultiplier: row.priceMultiplier,
                x: col * 35,
                y,
              });
            }
            y += 40;
          }

          await db.insert(seats).values(seatRecords);
        }
      } else {
        // Fetch existing screens for mapping
        const existingScreens = await db.query.venueScreens.findMany({ where: eq(venueScreens.venueId, venueObj.id) });
        for (const es of existingScreens) {
          screenMap[`${vData.name}:${es.name}`] = es.id;
        }
      }
    }

    // 6. Seed Blockbuster Movies
    logger.info("Seeding blockbuster movies catalog...");
    const movieList = [
      {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        durationMinutes: 166,
        languages: ["English", "Bengali"],
        genres: ["Action", "Adventure", "Sci-Fi"],
        releaseDate: new Date("2024-03-01"),
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/original/1pdfLPoVxWGlZ8L6zRjGlCO5vB1.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s52ig8C.jpg",
      },
      {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        durationMinutes: 180,
        languages: ["English"],
        genres: ["Biography", "Drama", "History"],
        releaseDate: new Date("2023-07-21"),
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGvC27g1W3E.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/fm6KqXrmjMQgrmZwhLrm9Eg9yY1.jpg",
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.",
        durationMinutes: 140,
        languages: ["English", "Bengali"],
        genres: ["Animation", "Action", "Adventure"],
        releaseDate: new Date("2023-06-02"),
        rating: "PG",
        posterUrl: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj7sfs8.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/4Hod1y8QBxLuv3V21Y9DsBFCrm4.jpg",
      },
      {
        title: "Avengers: Endgame",
        description: "After the devastating events of Infinity War, the Avengers assemble once more in order to reverse Thanos' actions.",
        durationMinutes: 181,
        languages: ["English", "Bengali"],
        genres: ["Action", "Adventure", "Sci-Fi"],
        releaseDate: new Date("2019-04-26"),
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/original/or06tUkWStQZRRfqDipxGoWM8cB.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mK9LvmKSr.jpg",
      },
      {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft through a wormhole.",
        durationMinutes: 169,
        languages: ["English"],
        genres: ["Adventure", "Drama", "Sci-Fi"],
        releaseDate: new Date("2014-11-07"),
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsX2P.jpg",
      },
      {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri.",
        durationMinutes: 192,
        languages: ["English", "Bengali"],
        genres: ["Action", "Adventure", "Sci-Fi"],
        releaseDate: new Date("2022-12-16"),
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/original/t6HIw3zCklwIGRlC2d7WiCC8W3.jpg",
        bannerUrl: "https://image.tmdb.org/t/p/original/s16H6vEUm9yG9GzMBPpUtZTwESy.jpg",
      },
    ];

    const insertedMovies: Record<string, string> = {};
    for (const mData of movieList) {
      let mObj = await db.query.movies.findFirst({ where: eq(movies.title, mData.title) });
      if (!mObj) {
        const [inserted] = await db.insert(movies).values(mData).returning();
        mObj = inserted!;
      }
      insertedMovies[mData.title] = mObj.id;
    }

    // 7. Seed Showtimes Across Screens
    logger.info("Seeding scheduled showtimes...");
    const allScreens = await db.query.venueScreens.findMany();

    if (allScreens.length > 0) {
      let baseHour = 10;
      for (const [title, movieId] of Object.entries(insertedMovies)) {
        for (const scr of allScreens.slice(0, 3)) {
          const startTime = new Date();
          startTime.setDate(startTime.getDate() + 1); // Tomorrow
          startTime.setHours(baseHour, 0, 0, 0);

          const endTime = new Date(startTime.getTime() + 150 * 60000);

          const existing = await db.query.shows.findFirst({
            where: eq(shows.movieId, movieId),
          });

          if (!existing) {
            await db.insert(shows).values({
              movieId,
              screenId: scr.id,
              startTime,
              endTime,
              language: "English",
              format: (scr.supportedFormats && scr.supportedFormats.includes("IMAX")) ? "IMAX 3D" : "2D",
              basePriceMinor: 50000, // BDT 500.00
            }).onConflictDoNothing();
          }

          baseHour = (baseHour + 4) % 22;
          if (baseHour < 10) baseHour = 10;
        }
      }
    }

    // 8. Seed Expanded Coupons & Offers
    logger.info("Seeding promotional coupons...");
    const couponList = [
      {
        code: "WELCOME50",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscountMinor: 20000, // BDT 200.00
        minOrderMinor: 50000, // BDT 500.00
        usageLimit: 1000,
      },
      {
        code: "BMSVIP100",
        discountType: "FIXED",
        discountValue: 10000, // BDT 100.00 flat off
        maxDiscountMinor: 10000,
        minOrderMinor: 80000, // BDT 800.00
        usageLimit: 500,
      },
      {
        code: "BKASH20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        maxDiscountMinor: 15000, // BDT 150.00
        minOrderMinor: 40000, // BDT 400.00
        usageLimit: 2000,
      },
    ];

    for (const cp of couponList) {
      const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, cp.code) });
      if (!existing) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        await db.insert(coupons).values({
          ...cp,
          expiresAt,
        });
      }
    }

    // 9. Seed Bank Offers & BOGO Campaigns
    logger.info("Seeding bank offers & BOGO campaigns...");
    const bankOfferList = [
      {
        title: "bKash 10% Instant Cashback",
        description: "Get 10% instant cashback on ticket payment using bKash Tokenized checkout",
        type: "BANK_CASHBACK",
        paymentMethod: "BKASH",
        discountPercentage: 10,
        maxDiscountMinor: 15000, // BDT 150.00
        minOrderMinor: 30000,
      },
      {
        title: "Visa Card Buy One Get One Free (BOGO)",
        description: "Buy 1 movie ticket and get 1 ticket free with Visa Signature credit cards",
        type: "BOGO",
        paymentMethod: "STRIPE",
        maxDiscountMinor: 50000, // BDT 500.00
        minOrderMinor: 50000,
      },
    ];

    for (const bo of bankOfferList) {
      const existing = await db.query.offers.findFirst({ where: eq(offers.title, bo.title) });
      if (!existing) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
        await db.insert(offers).values({
          ...bo,
          expiresAt,
        });
      }
    }

    // 10. Seed Movie Cast, Crew & Media Trailers
    logger.info("Seeding movie cast, crew, and trailer media...");
    const duneMovie = await db.query.movies.findFirst({ where: eq(movies.title, "Dune: Part Two") });
    if (duneMovie) {
      const existingCast = await db.query.movieCast.findFirst({ where: eq(movieCast.movieId, duneMovie.id) });
      if (!existingCast) {
        await db.insert(movieCast).values([
          { movieId: duneMovie.id, actorName: "Timothée Chalamet", characterName: "Paul Atreides", roleType: "LEAD" },
          { movieId: duneMovie.id, actorName: "Zendaya", characterName: "Chani", roleType: "LEAD" },
          { movieId: duneMovie.id, actorName: "Rebecca Ferguson", characterName: "Lady Jessica", roleType: "SUPPORTING" },
          { movieId: duneMovie.id, actorName: "Javier Bardem", characterName: "Stilgar", roleType: "SUPPORTING" },
        ]);

        await db.insert(movieCrew).values([
          { movieId: duneMovie.id, name: "Denis Villeneuve", jobTitle: "DIRECTOR" },
          { movieId: duneMovie.id, name: "Hans Zimmer", jobTitle: "COMPOSER" },
        ]);

        await db.insert(movieMedia).values([
          { movieId: duneMovie.id, type: "TRAILER", url: "https://www.youtube.com/watch?v=Way9Dexny3w", title: "Official Main Trailer" },
          { movieId: duneMovie.id, type: "BACKDROP", url: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s52ig8C.jpg", title: "Backdrop Banner" },
        ]);
      }
    }

    // 11. Seed Live Events, Concerts & Sports Matches
    logger.info("Seeding live concerts, stand-up comedy specials, and sports matches...");
    const dhakaCityId = insertedCities["Dhaka"];
    const eventSeedList = [
      {
        title: "Coke Studio Bangla Live Concert 2026",
        description: "Experience the biggest musical extravaganza featuring top artists and fusion bands live on stage!",
        category: "CONCERT" as const,
        venueName: "Army Stadium, Banani, Dhaka",
        address: "Banani, Dhaka 1213",
        bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
        posterUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
        cityId: dhakaCityId,
        performers: [
          { name: "Shayan Chowdhury Arnob", role: "ARTIST" },
          { name: "Momotaz Begum", role: "ARTIST" },
          { name: "Naveed Mahbub", role: "HOST" },
        ],
        slots: [
          { startTime: new Date(Date.now() + 86400000 * 3), endTime: new Date(Date.now() + 86400000 * 3 + 18000000), tierName: "VIP Front Row", priceMinor: 250000, totalSeats: 500 },
          { startTime: new Date(Date.now() + 86400000 * 3), endTime: new Date(Date.now() + 86400000 * 3 + 18000000), tierName: "General Admission", priceMinor: 100000, totalSeats: 3000 },
        ],
      },
      {
        title: "International Stand-Up Comedy Special: Laughathon",
        description: "A night of hilarious non-stop comedy with top stand-up comedians from across Asia.",
        category: "COMEDY" as const,
        venueName: "KIB Auditorium, Farmgate, Dhaka",
        address: "Farmgate, Dhaka 1215",
        bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca",
        cityId: dhakaCityId,
        performers: [
          { name: "Solaiman Sukhon", role: "COMEDIAN" },
          { name: "Naveed Mahbub", role: "COMEDIAN" },
        ],
        slots: [
          { startTime: new Date(Date.now() + 86400000 * 5), endTime: new Date(Date.now() + 86400000 * 5 + 7200000), tierName: "Premium Pass", priceMinor: 150000, totalSeats: 200 },
          { startTime: new Date(Date.now() + 86400000 * 5), endTime: new Date(Date.now() + 86400000 * 5 + 7200000), tierName: "Standard Pass", priceMinor: 80000, totalSeats: 800 },
        ],
      },
      {
        title: "BPL T20 Cricket Final Match 2026",
        description: "Grand Championship Final of Bangladesh Premier League T20 Cricket Tournament!",
        category: "SPORTS" as const,
        venueName: "Sher-e-Bangla National Cricket Stadium, Mirpur, Dhaka",
        address: "Mirpur 11, Dhaka 1216",
        bannerUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e",
        posterUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da",
        cityId: dhakaCityId,
        performers: [
          { name: "Dhaka Dominators", role: "TEAM" },
          { name: "Comilla Victorians", role: "TEAM" },
        ],
        slots: [
          { startTime: new Date(Date.now() + 86400000 * 7), endTime: new Date(Date.now() + 86400000 * 7 + 14400000), tierName: "Grand Stand VIP", priceMinor: 300000, totalSeats: 400 },
          { startTime: new Date(Date.now() + 86400000 * 7), endTime: new Date(Date.now() + 86400000 * 7 + 14400000), tierName: "Eastern Gallery", priceMinor: 50000, totalSeats: 5000 },
        ],
      },
    ];

    for (const ev of eventSeedList) {
      const existing = await db.query.events.findFirst({ where: eq(events.title, ev.title) });
      if (!existing) {
        await eventService.createEvent(ev);
      }
    }

    logger.info("✅ Expanded database seeding completed successfully!");
  } catch (err) {
    logger.error({ err }, "❌ Database seeding failed");
    throw err;
  }
}

// Execute directly if run via CLI
if (import.meta.main) {
  await seedDatabase();
  process.exit(0);
}
