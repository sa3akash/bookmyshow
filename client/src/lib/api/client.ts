import { Movie, Venue, Show, SeatItem, Booking, Coupon } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `API HTTP error ${res.status}`);
    }
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.warn(`[API Client] Call to ${url} failed:`, err);
    throw err;
  }
}

apiClient.get = <T>(endpoint: string, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined });

apiClient.put = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined });

apiClient.patch = <T>(endpoint: string, body?: unknown, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined });

apiClient.delete = <T>(endpoint: string, options: RequestInit = {}) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });

// Mock Data Generators for Seamless Client Browsing & Fallback
export const MOCK_MOVIES: Movie[] = [
  {
    id: "movie_avatar3",
    title: "Avatar: Fire and Ash",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    description: "Jake Sully and Neytiri encounter the Ash People, a fierce Na'vi tribe associated with fire and volcanic regions, testing their family unity to the limit.",
    durationMinutes: 192,
    languages: ["English", "Hindi", "Bengali Dubbed"],
    genres: ["Sci-Fi", "Action", "Adventure"],
    releaseDate: "2026-08-14",
    rating: 9.2,
    votesCount: 48500,
    certificate: "U/A 13+",
    formats: ["IMAX 3D", "4DX", "DOLBY ATMOS 2D"],
    status: "NOW_SHOWING",
    cast: [
      { name: "Sam Worthington", role: "Jake Sully", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
      { name: "Zoe Saldaña", role: "Neytiri", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" },
      { name: "Sigourney Weaver", role: "Kiri", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80" },
    ],
    crew: [
      { name: "James Cameron", role: "Director & Producer" },
      { name: "Jon Landau", role: "Producer" },
    ],
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
  },
  {
    id: "movie_oppenheimer2",
    title: "Oppenheimer: The Legacy",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    description: "An in-depth exploration of the post-war atomic era and the geopolitical aftermath of J. Robert Oppenheimer's revolutionary breakthrough.",
    durationMinutes: 180,
    languages: ["English"],
    genres: ["Biography", "Drama", "History"],
    releaseDate: "2026-08-10",
    rating: 8.9,
    votesCount: 34200,
    certificate: "R",
    formats: ["IMAX 70MM", "DOLBY ATMOS 2D"],
    status: "NOW_SHOWING",
    cast: [
      { name: "Cillian Murphy", role: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", role: "Katherine Oppenheimer" },
    ],
    crew: [{ name: "Christopher Nolan", role: "Director" }],
  },
  {
    id: "movie_spiderverse3",
    title: "Spider-Man: Beyond the Spider-Verse",
    posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    description: "Miles Morales embarks on his final multiverse dimension trip to rescue his family and unite Spider-Heroes across realities.",
    durationMinutes: 140,
    languages: ["English", "Hindi"],
    genres: ["Animation", "Action", "Adventure"],
    releaseDate: "2026-08-20",
    rating: 9.4,
    votesCount: 62000,
    certificate: "PG",
    formats: ["3D", "IMAX 3D", "2D"],
    status: "COMING_SOON",
  },
  {
    id: "movie_dune3",
    title: "Dune: Messiah",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    description: "Paul Atreides rules as Emperor of the Known Universe, facing political conspiracies and moral dilemmas on the desert planet Arrakis.",
    durationMinutes: 165,
    languages: ["English"],
    genres: ["Sci-Fi", "Adventure", "Drama"],
    releaseDate: "2026-09-01",
    rating: 9.1,
    votesCount: 29000,
    certificate: "U/A 16+",
    formats: ["IMAX 3D", "DOLBY ATMOS 2D"],
    status: "TRENDING",
  },
];

export const MOCK_VENUES: Venue[] = [
  {
    id: "v_star_bashundhara",
    cityId: "city_dhaka",
    name: "Star Cineplex - Bashundhara City",
    area: "Panthapath",
    address: "Level 8, Bashundhara City Shopping Mall, Panthapath, Dhaka",
    totalScreens: 8,
    amenities: ["IMAX 3D Laser", "Dolby Atmos 64-Ch", "VIP Recliners", "Food Court", "Valet Parking"],
    distanceKm: 2.4,
  },
  {
    id: "v_star_sks",
    cityId: "city_dhaka",
    name: "Star Cineplex - SKS Tower",
    area: "Mohakhali",
    address: "Level 3, SKS Tower, VIP Road, Mohakhali, Dhaka",
    totalScreens: 5,
    amenities: ["4DX Motion Pods", "Dolby Atmos", "Premium Lounges"],
    distanceKm: 4.1,
  },
  {
    id: "v_blockbuster_jamuna",
    cityId: "city_dhaka",
    name: "Blockbuster Cinemas - Jamuna Future Park",
    area: "Kuril",
    address: "Level 5, Jamuna Future Park, Pragati Sarani, Kuril, Dhaka",
    totalScreens: 7,
    amenities: ["3D Laser", "Dolby Surround", "Food Mall", "Bowling Alley"],
    distanceKm: 6.8,
  },
  {
    id: "v_silver_screen_ctg",
    cityId: "city_ctg",
    name: "Silver Screen Theatre - Finlay Square",
    area: "2 No. Gate",
    address: "Finlay Square Shopping Mall, 2 No. Gate, Nasirabad, Chattogram",
    totalScreens: 3,
    amenities: ["4K Projection", "Dolby 7.1", "VIP Sofa Seating"],
    distanceKm: 3.2,
  },
];

export function generateMockShows(movieId: string, cityId: string, dateStr: string): Show[] {
  const venues = MOCK_VENUES.filter((v) => v.cityId === cityId || cityId === "city_dhaka");
  const movie = MOCK_MOVIES.find((m) => m.id === movieId) || MOCK_MOVIES[0];
  const shows: Show[] = [];

  const timeSlots = [
    { start: "10:30 AM", end: "01:30 PM", avail: "AVAILABLE" as const },
    { start: "01:45 PM", end: "04:45 PM", avail: "FAST_FILLING" as const },
    { start: "05:15 PM", end: "08:15 PM", avail: "ALMOST_FULL" as const },
    { start: "08:30 PM", end: "11:30 PM", avail: "AVAILABLE" as const },
  ];

  venues.forEach((v, vIdx) => {
    timeSlots.forEach((slot, sIdx) => {
      shows.push({
        id: `show_${v.id}_${vIdx}_${sIdx}`,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.posterUrl,
        venueId: v.id,
        venueName: v.name,
        screenId: `scr_${v.id}_${(sIdx % 2) + 1}`,
        screenName: `Hall ${(sIdx % 3) + 1} (${sIdx % 2 === 0 ? "IMAX 3D" : "Dolby Atmos"})`,
        showDate: dateStr,
        startTime: slot.start,
        endTime: slot.end,
        language: movie.languages[0] || "English",
        format: movie.formats[sIdx % movie.formats.length] || "2D",
        basePrice: 450 + (sIdx % 2) * 200,
        availability: slot.avail,
        availableSeatsCount: slot.avail === "ALMOST_FULL" ? 12 : slot.avail === "FAST_FILLING" ? 45 : 120,
        totalSeatsCount: 160,
      });
    });
  });

  return shows;
}

export function generateMockSeats(showId: string, basePrice: number): SeatItem[] {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cols = 14;
  const seats: SeatItem[] = [];

  rows.forEach((r, rIdx) => {
    for (let c = 1; c <= cols; c++) {
      let type: SeatItem["type"] = "REGULAR";
      let category: SeatItem["category"] = "SILVER";
      let price = basePrice;

      if (rIdx >= 6) {
        type = "RECLINER";
        category = "RECLINER";
        price = basePrice * 2.2;
      } else if (rIdx >= 4) {
        type = "VIP";
        category = "PLATINUM";
        price = basePrice * 1.5;
      } else if (rIdx >= 2) {
        type = "PREMIUM";
        category = "GOLD";
        price = basePrice * 1.2;
      }

      // Add walk-way gaps after col 4 and col 10
      const xOffset = c > 10 ? c * 48 + 40 : c > 4 ? c * 48 + 20 : c * 48;
      const yOffset = rIdx * 52 + 100;

      // Status randomness
      const isBooked = (rIdx * 14 + c) % 7 === 0 || (rIdx === 3 && c >= 5 && c <= 8);
      const isBlocked = rIdx === 0 && (c === 1 || c === 14);

      seats.push({
        id: `seat_${showId}_${r}_${c}`,
        rowId: r,
        rowLabel: r,
        col: c,
        number: c,
        label: `${r}${c}`,
        x: xOffset,
        y: yOffset,
        width: 36,
        height: 38,
        rotation: 0,
        type,
        category,
        price: Math.round(price),
        status: isBooked ? "BOOKED" : isBlocked ? "BLOCKED" : "AVAILABLE",
      });
    }
  });

  return seats;
}

export const MOCK_COUPONS: Coupon[] = [
  { code: "BMS100", discountAmount: 100, description: "৳100 Flat Discount on movie tickets" },
  { code: "BMSFIFTY", discountPercent: 15, description: "15% Off up to ৳200 on all showtimes" },
  { code: "BKASH150", discountAmount: 150, minBookingAmount: 800, description: "৳150 cashback when paying via bKash" },
];
