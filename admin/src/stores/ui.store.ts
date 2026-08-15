import { create } from "zustand";

export type DateRangePeriod = "today" | "yesterday" | "7days" | "30days" | "this_month" | "last_month" | "this_year" | "custom";

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  dateRange: DateRangePeriod;
  customStartDate?: string;
  customEndDate?: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setDateRange: (range: DateRangePeriod, startDate?: string, endDate?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: "dark",
  dateRange: "today",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setDateRange: (dateRange, customStartDate, customEndDate) => set({ dateRange, customStartDate, customEndDate }),
}));
