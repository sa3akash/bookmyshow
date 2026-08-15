import { create } from "zustand";
import { persist } from "zustand/middleware";
import { City } from "@/types";

export const DEFAULT_CITIES: City[] = [
  { id: "city_dhaka", name: "Dhaka", state: "Dhaka Division", country: "Bangladesh", isPopular: true },
  { id: "city_ctg", name: "Chattogram", state: "Chattogram Division", country: "Bangladesh", isPopular: true },
  { id: "city_sylhet", name: "Sylhet", state: "Sylhet Division", country: "Bangladesh", isPopular: true },
  { id: "city_rajshahi", name: "Rajshahi", state: "Rajshahi Division", country: "Bangladesh", isPopular: true },
  { id: "city_khulna", name: "Khulna", state: "Khulna Division", country: "Bangladesh", isPopular: true },
  { id: "city_mymensingh", name: "Mymensingh", state: "Mymensingh Division", country: "Bangladesh", isPopular: false },
  { id: "city_barishal", name: "Barishal", state: "Barishal Division", country: "Bangladesh", isPopular: false },
  { id: "city_rangpur", name: "Rangpur", state: "Rangpur Division", country: "Bangladesh", isPopular: false },
];

interface LocationState {
  activeCity: City;
  availableCities: City[];
  isLocationModalOpen: boolean;
  setCity: (city: City) => void;
  setCityById: (cityId: string) => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      activeCity: DEFAULT_CITIES[0],
      availableCities: DEFAULT_CITIES,
      isLocationModalOpen: false,
      setCity: (city) => set({ activeCity: city, isLocationModalOpen: false }),
      setCityById: (cityId) => {
        const found = get().availableCities.find((c) => c.id === cityId);
        if (found) {
          set({ activeCity: found, isLocationModalOpen: false });
        }
      },
      openLocationModal: () => set({ isLocationModalOpen: true }),
      closeLocationModal: () => set({ isLocationModalOpen: false }),
    }),
    {
      name: "bms_customer_location",
      partialize: (state) => ({ activeCity: state.activeCity }),
    }
  )
);
