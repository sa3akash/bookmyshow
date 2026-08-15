"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ==================== CITIES ====================
export interface CityRecord {
  id: string;
  name: string;
  state?: string;
  country: string;
  latitude?: string;
  longitude?: string;
  isActive?: boolean;
}

export function useCitiesQuery() {
  return useQuery<CityRecord[]>({
    queryKey: ["admin", "cities"],
    queryFn: async () => {
      const data = await apiClient<any[]>("/cities");
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
  });
}

export function useCreateCityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCity: { name: string; state?: string; country?: string }) => {
      return await apiClient.post<CityRecord>("/cities", newCity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cities"] });
    },
  });
}

// ==================== VENUES ====================
export interface VenueRecord {
  id: string;
  cityId: string;
  name: string;
  city: string;
  area: string;
  address: string;
  contactPhone?: string;
  totalScreens: number;
  totalCapacity: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  screens?: any[];
}

export function useVenuesQuery(cityId?: string) {
  return useQuery<VenueRecord[]>({
    queryKey: ["admin", "venues", cityId || "default"],
    queryFn: async () => {
      let targetCityId = cityId;

      // If no cityId provided, fetch first available city from server
      if (!targetCityId) {
        const citiesList = await apiClient<any[]>("/cities").catch(() => []);
        if (citiesList && citiesList.length > 0) {
          targetCityId = citiesList[0].id;
        }
      }

      if (!targetCityId) return [];

      const data = await apiClient<any[]>(`/venues?cityId=${targetCityId}`);
      if (Array.isArray(data)) {
        return data.map((v: any) => ({
          id: v.id,
          cityId: v.cityId || targetCityId,
          name: v.name,
          city: v.cityName || v.city || "Selected City",
          area: v.area || "Area",
          address: v.address || "",
          contactPhone: v.contactPhone || "N/A",
          totalScreens: Array.isArray(v.screens) ? v.screens.length : (v.totalScreens || 0),
          totalCapacity: v.totalCapacity || (Array.isArray(v.screens) ? v.screens.reduce((acc: number, s: any) => acc + (s.totalSeats || 0), 0) : 0),
          status: v.isActive !== false ? "ACTIVE" : "INACTIVE",
          screens: v.screens || [],
        }));
      }
      return [];
    },
    enabled: true,
  });
}

export function useCreateVenueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newVenue: { cityId: string; name: string; address: string; amenities?: string[] }) => {
      return await apiClient.post<VenueRecord>("/venues", newVenue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
    },
  });
}

// ==================== MOVIES ====================
export interface MovieRecord {
  id: string;
  poster: string;
  title: string;
  language: string;
  genres: string[];
  durationMinutes: number;
  releaseDate: string;
  rating: number;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED";
  showsCount: number;
  bookingsCount: number;
  revenueBDT: number;
}

export function useMoviesQuery(filters?: { cityId?: string; genre?: string; language?: string; status?: string }) {
  return useQuery<MovieRecord[]>({
    queryKey: ["admin", "movies", filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.cityId) params.append("cityId", filters.cityId);
      if (filters?.genre) params.append("genre", filters.genre);
      if (filters?.language) params.append("language", filters.language);
      if (filters?.status) params.append("status", filters.status);

      const queryString = params.toString();
      const endpoint = `/movies${queryString ? `?${queryString}` : ""}`;

      const data = await apiClient<any[]>(endpoint);
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          id: m.id || m.movieId,
          poster: m.posterUrl || m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&auto=format&fit=crop&q=80",
          title: m.title,
          language: Array.isArray(m.languages) ? m.languages.join(", ") : (m.language || "English"),
          genres: Array.isArray(m.genres) ? m.genres : [m.genre || "General"],
          durationMinutes: m.durationMinutes || 120,
          releaseDate: m.releaseDate ? String(m.releaseDate).slice(0, 10) : "2026-08-15",
          rating: typeof m.rating === "number" ? m.rating : parseFloat(m.rating) || 8.0,
          status: m.status || "PUBLISHED",
          showsCount: m.showsCount || 0,
          bookingsCount: m.bookingsCount || 0,
          revenueBDT: m.revenueBDT || 0,
        }));
      }
      return [];
    },
  });
}

export function useCreateMovieMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMovie: {
      title: string;
      description?: string;
      durationMinutes: number;
      languages: string[];
      genres: string[];
      releaseDate: string;
      rating?: string;
      posterUrl?: string;
      bannerUrl?: string;
    }) => {
      return await apiClient.post<MovieRecord>("/movies", newMovie);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
    },
  });
}

// ==================== DASHBOARD STATS ====================
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const stats = await apiClient<any>("/analytics/overview");
      return stats;
    },
    refetchInterval: 30000,
  });
}
