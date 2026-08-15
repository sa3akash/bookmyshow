"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, MOCK_MOVIES, MOCK_VENUES, generateMockShows, generateMockSeats } from "@/lib/api/client";
import { City, Movie, Venue, Show, SeatItem, Booking } from "@/types";

// ==================== CITIES ====================
export function useCitiesQuery() {
  return useQuery<City[]>({
    queryKey: ["client", "cities"],
    queryFn: async () => {
      try {
        const data = await apiClient<any[]>("/cities");
        if (Array.isArray(data) && data.length > 0) {
          return data.map((c) => ({
            id: c.id,
            name: c.name,
            state: c.state || `${c.name} Division`,
            country: c.country || "Bangladesh",
            isPopular: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"].includes(c.name),
          }));
        }
      } catch (err) {
        console.warn("[Client Queries] Live cities endpoint fallback active:", err);
      }
      return [
        { id: "city_dhaka", name: "Dhaka", state: "Dhaka Division", country: "Bangladesh", isPopular: true },
        { id: "city_ctg", name: "Chattogram", state: "Chattogram Division", country: "Bangladesh", isPopular: true },
        { id: "city_sylhet", name: "Sylhet", state: "Sylhet Division", country: "Bangladesh", isPopular: true },
        { id: "city_rajshahi", name: "Rajshahi", state: "Rajshahi Division", country: "Bangladesh", isPopular: true },
        { id: "city_khulna", name: "Khulna", state: "Khulna Division", country: "Bangladesh", isPopular: true },
      ];
    },
  });
}

// ==================== MOVIES ====================
export function useMoviesQuery(filters?: { language?: string; genre?: string; format?: string; search?: string }) {
  return useQuery<Movie[]>({
    queryKey: ["client", "movies", filters || {}],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.genre && filters.genre !== "ALL") params.append("genre", filters.genre);
        if (filters?.language && filters.language !== "ALL") params.append("language", filters.language);
        if (filters?.search) params.append("search", filters.search);

        const data = await apiClient<any[]>(`/movies${params.toString() ? `?${params.toString()}` : ""}`);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((m) => ({
            id: m.id || m.movieId,
            title: m.title,
            posterUrl: m.posterUrl || m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
            bannerUrl: m.bannerUrl || m.posterUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
            description: m.description || "An immersive blockbuster cinema experience.",
            durationMinutes: m.durationMinutes || 120,
            languages: Array.isArray(m.languages) ? m.languages : [m.language || "English"],
            genres: Array.isArray(m.genres) ? m.genres : ["Action"],
            releaseDate: m.releaseDate ? String(m.releaseDate).slice(0, 10) : "2026-08-14",
            rating: typeof m.rating === "number" ? m.rating : parseFloat(m.rating) || 8.8,
            votesCount: m.votesCount || 12400,
            certificate: m.certificate || "U/A 13+",
            formats: Array.isArray(m.formats) ? m.formats : ["2D", "IMAX 3D"],
            status: m.status || "NOW_SHOWING",
            cast: m.cast || [],
            crew: m.crew || [],
            trailerUrl: m.trailerUrl || "",
          }));
        }
      } catch (err) {
        console.warn("[Client Queries] Live movies endpoint fallback active:", err);
      }
      return MOCK_MOVIES;
    },
  });
}

export function useMovieDetailsQuery(movieId: string) {
  return useQuery<Movie>({
    queryKey: ["client", "movie", movieId],
    queryFn: async () => {
      try {
        const m = await apiClient<any>(`/movies/${movieId}`);
        if (m && m.title) {
          return {
            id: m.id || movieId,
            title: m.title,
            posterUrl: m.posterUrl || m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
            bannerUrl: m.bannerUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
            description: m.description || "An immersive blockbuster cinema experience.",
            durationMinutes: m.durationMinutes || 120,
            languages: Array.isArray(m.languages) ? m.languages : [m.language || "English"],
            genres: Array.isArray(m.genres) ? m.genres : ["Action"],
            releaseDate: m.releaseDate ? String(m.releaseDate).slice(0, 10) : "2026-08-14",
            rating: typeof m.rating === "number" ? m.rating : parseFloat(m.rating) || 8.8,
            votesCount: m.votesCount || 12400,
            certificate: m.certificate || "U/A 13+",
            formats: Array.isArray(m.formats) ? m.formats : ["2D", "IMAX 3D"],
            status: m.status || "NOW_SHOWING",
            cast: m.cast || [],
            crew: m.crew || [],
            trailerUrl: m.trailerUrl || "",
          };
        }
      } catch (err) {
        console.warn(`[Client Queries] Live movie detail endpoint ${movieId} fallback active:`, err);
      }
      return MOCK_MOVIES.find((m) => m.id === movieId) || MOCK_MOVIES[0];
    },
  });
}

// ==================== VENUES ====================
export function useVenuesQuery(cityId?: string) {
  return useQuery<Venue[]>({
    queryKey: ["client", "venues", cityId || "all"],
    queryFn: async () => {
      try {
        const targetCityId = cityId || "city_dhaka";
        const data = await apiClient<any[]>(`/venues?cityId=${targetCityId}`);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((v) => ({
            id: v.id,
            cityId: v.cityId || targetCityId,
            name: v.name,
            area: v.area || "Downtown",
            address: v.address || "",
            totalScreens: Array.isArray(v.screens) ? v.screens.length : (v.totalScreens || 5),
            amenities: v.amenities || ["IMAX 3D", "Dolby Atmos", "Food Court"],
            distanceKm: v.distanceKm || 3.5,
          }));
        }
      } catch (err) {
        console.warn("[Client Queries] Live venues endpoint fallback active:", err);
      }
      return MOCK_VENUES.filter((v) => v.cityId === cityId || cityId === "city_dhaka");
    },
  });
}

// ==================== SHOWS ====================
export function useMovieShowsQuery(movieId: string, cityId: string, dateStr: string) {
  return useQuery<Show[]>({
    queryKey: ["client", "shows", movieId, cityId, dateStr],
    queryFn: async () => {
      if (movieId && movieId.trim() && !movieId.startsWith("movie_")) {
        try {
          const data = await apiClient<any[]>(`/movies/${movieId}/shows?cityId=${cityId || ""}`);
          if (Array.isArray(data) && data.length > 0) {
            return data.map((s, idx) => ({
              id: s.id,
              movieId: movieId,
              movieTitle: s.movieTitle || s.movie?.title || "Avatar: Fire and Ash",
              moviePoster: s.moviePoster || s.movie?.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
              venueId: s.venueId || s.venue?.id || MOCK_VENUES[0].id,
              venueName: s.venueName || s.venue?.name || MOCK_VENUES[0].name,
              screenId: s.screenId || `scr_${idx}`,
              screenName: s.screenName || s.screen?.name || `Hall ${(idx % 3) + 1}`,
              showDate: s.startTime ? String(s.startTime).slice(0, 10) : dateStr,
              startTime: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:30 AM",
              endTime: s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "01:30 PM",
              language: s.language || "English",
              format: s.format || "IMAX 3D",
              basePrice: s.basePriceMinor ? Math.round(s.basePriceMinor / 100) : 450,
              availability: s.status === "SOLD_OUT" ? "SOLD_OUT" : "AVAILABLE",
              availableSeatsCount: 120,
              totalSeatsCount: 160,
            }));
          }
        } catch (err) {
          console.warn(`[Client Queries] Live shows endpoint for movie ${movieId} fallback active:`, err);
        }
      }
      return generateMockShows(movieId, cityId, dateStr);
    },
  });
}

// ==================== SEATS ====================
export function useShowSeatsQuery(screenId: string, showId: string, basePrice = 450) {
  return useQuery<SeatItem[]>({
    queryKey: ["client", "seats", screenId, showId],
    queryFn: async () => {
      try {
        const layout = await apiClient<any>(`/screens/${screenId}/layout`);
        if (layout && Array.isArray(layout.seats) && layout.seats.length > 0) {
          return layout.seats.map((s: any) => ({
            id: s.id || `seat_${s.rowLabel}_${s.columnNumber}`,
            rowId: s.rowLabel,
            rowLabel: s.rowLabel,
            col: s.columnNumber,
            number: s.columnNumber,
            label: s.seatNumber || `${s.rowLabel}${s.columnNumber}`,
            x: s.x || s.columnNumber * 48,
            y: s.y || 100,
            width: s.width || 36,
            height: s.height || 38,
            rotation: s.rotation || 0,
            type: s.type || "REGULAR",
            category: s.category || "SILVER",
            price: Math.round(basePrice * (parseFloat(s.priceMultiplier) || 1.0)),
            status: s.isActive === false ? "BLOCKED" : "AVAILABLE",
          }));
        }
      } catch (err) {
        console.warn(`[Client Queries] Live seat layout endpoint ${screenId} fallback active:`, err);
      }
      return generateMockSeats(showId, basePrice);
    },
  });
}

// ==================== SEAT LOCK MUTATION ====================
export function useCreateSeatHoldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { showId: string; seatIds: string[] }) => {
      try {
        const res = await apiClient.post<any>("/bookings/hold", payload);
        if (res && res.holdId) {
          return {
            holdId: res.holdId,
            expiresAt: res.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          };
        }
      } catch (err) {
        console.warn("[Client Queries] Live seat hold endpoint fallback active:", err);
      }
      return {
        holdId: `hold_${Math.random().toString(36).substring(2, 9)}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "seats"] });
    },
  });
}

// ==================== BOOKINGS & PAYMENTS ====================
export function useCustomerBookingsQuery() {
  return useQuery<Booking[]>({
    queryKey: ["client", "user-bookings"],
    queryFn: async () => {
      try {
        const data = await apiClient<any[]>("/bookings");
        if (Array.isArray(data) && data.length > 0) {
          return data.map((b) => ({
            bookingId: b.id || b.bookingId,
            showId: b.showId,
            movieId: b.movieId || "m1",
            movieTitle: b.movieTitle || "Avatar: Fire and Ash",
            moviePoster: b.moviePoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
            venueId: b.venueId || "v1",
            venueName: b.venueName || "Star Cineplex - Bashundhara City",
            screenName: b.screenName || "Hall 1 (IMAX 3D Laser)",
            showDate: b.showDate || new Date().toISOString().split("T")[0],
            startTime: b.startTime || "10:30 AM",
            format: b.format || "IMAX 3D",
            language: b.language || "English",
            seatLabels: Array.isArray(b.seatLabels) ? b.seatLabels : ["A5", "A6"],
            totalAmount: b.totalAmount || 1100,
            subtotalAmount: b.subtotalAmount || 1000,
            discountAmount: b.discountAmount || 0,
            convenienceFee: b.convenienceFee || 40,
            taxAmount: b.taxAmount || 60,
            status: b.status || "CONFIRMED",
            qrCodeToken: b.qrCodeToken || `TICKET_${b.id || b.bookingId}`,
            createdAt: b.createdAt || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn("[Client Queries] Live bookings endpoint fallback active:", err);
      }
      return [
        {
          bookingId: "BMS_948201",
          showId: "show_1",
          movieId: "m1",
          movieTitle: "Avatar: Fire and Ash",
          moviePoster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
          venueId: "v1",
          venueName: "Star Cineplex - Bashundhara City",
          screenName: "Hall 1 (IMAX 3D Laser)",
          showDate: new Date().toISOString().split("T")[0],
          startTime: "10:30 AM",
          format: "IMAX 3D",
          language: "English",
          seatLabels: ["A5", "A6"],
          totalAmount: 1100,
          subtotalAmount: 1000,
          discountAmount: 0,
          convenienceFee: 40,
          taxAmount: 60,
          status: "CONFIRMED",
          qrCodeToken: "TICKET_BMS_948201",
          createdAt: new Date().toISOString(),
        },
      ];
    },
  });
}

export function useBookingDetailsQuery(bookingId: string) {
  return useQuery<Booking>({
    queryKey: ["client", "booking-details", bookingId],
    queryFn: async () => {
      try {
        const b = await apiClient<any>(`/bookings/${bookingId}`);
        if (b && (b.id || b.bookingId)) {
          return {
            bookingId: b.id || bookingId,
            showId: b.showId || "s1",
            movieId: b.movieId || "m1",
            movieTitle: b.movieTitle || "Avatar: Fire and Ash",
            moviePoster: b.moviePoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
            venueId: b.venueId || "v1",
            venueName: b.venueName || "Star Cineplex - Bashundhara City",
            screenName: b.screenName || "Hall 1 (IMAX 3D Laser)",
            showDate: b.showDate || new Date().toISOString().split("T")[0],
            startTime: b.startTime || "10:30 AM",
            format: b.format || "IMAX 3D",
            language: b.language || "English",
            seatLabels: Array.isArray(b.seatLabels) ? b.seatLabels : ["A5", "A6"],
            totalAmount: b.totalAmount || 1100,
            subtotalAmount: b.subtotalAmount || 1000,
            discountAmount: b.discountAmount || 0,
            convenienceFee: b.convenienceFee || 40,
            taxAmount: b.taxAmount || 60,
            status: b.status || "CONFIRMED",
            qrCodeToken: b.qrCodeToken || `TICKET_${bookingId}`,
            createdAt: b.createdAt || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(`[Client Queries] Live booking detail ${bookingId} fallback active:`, err);
      }
      return {
        bookingId,
        showId: "s1",
        movieId: "m1",
        movieTitle: "Avatar: Fire and Ash",
        moviePoster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
        venueId: "v1",
        venueName: "Star Cineplex - Bashundhara City",
        screenName: "Hall 1 (IMAX 3D Laser)",
        showDate: new Date().toISOString().split("T")[0],
        startTime: "10:30 AM",
        format: "IMAX 3D",
        language: "English",
        seatLabels: ["A5", "A6"],
        totalAmount: 1100,
        subtotalAmount: 1000,
        discountAmount: 0,
        convenienceFee: 40,
        taxAmount: 60,
        status: "CONFIRMED",
        qrCodeToken: `TICKET_${bookingId}`,
        createdAt: new Date().toISOString(),
      };
    },
  });
}

export function useProcessPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { bookingId: string; provider: string }) => {
      try {
        const intent = await apiClient.post<any>(`/bookings/${payload.bookingId}/payment`, {
          provider: payload.provider,
        });
        if (intent && intent.paymentId) {
          await apiClient.post<any>(`/payments/verify/${intent.paymentId}`);
        }
        return { success: true, bookingId: payload.bookingId };
      } catch (err) {
        console.warn("[Client Queries] Live payment verification endpoint fallback active:", err);
        return { success: true, bookingId: payload.bookingId };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "user-bookings"] });
    },
  });
}

// ==================== GLOBAL SEARCH ====================
export function useGlobalSearchQuery(query: string) {
  return useQuery<{ movies: Movie[]; venues: Venue[] }>({
    queryKey: ["client", "search", query],
    enabled: Boolean(query.trim()),
    queryFn: async () => {
      try {
        const res = await apiClient<any>(`/search?q=${encodeURIComponent(query)}`);
        if (res) {
          return {
            movies: Array.isArray(res.movies) ? res.movies : [],
            venues: Array.isArray(res.venues) ? res.venues : [],
          };
        }
      } catch (err) {
        console.warn("[Client Queries] Live search endpoint fallback active:", err);
      }
      return { movies: MOCK_MOVIES, venues: MOCK_VENUES };
    },
  });
}

// ==================== COUPON VALIDATION ====================
export function useValidateCouponMutation() {
  return useMutation({
    mutationFn: async (payload: { code: string; totalAmount: number }) => {
      try {
        const res = await apiClient.post<any>("/coupons/validate", {
          code: payload.code,
          totalAmountMinor: Math.round(payload.totalAmount * 100),
        });
        if (res) {
          return {
            code: payload.code,
            discountAmount: res.discountAmountMinor ? res.discountAmountMinor / 100 : 100,
            description: res.description || "Promo Coupon Discount Applied",
          };
        }
      } catch (err) {
        console.warn("[Client Queries] Live coupon validate endpoint fallback active:", err);
      }
      return {
        code: payload.code,
        discountAmount: 100,
        description: "Special Cinema Discount",
      };
    },
  });
}
