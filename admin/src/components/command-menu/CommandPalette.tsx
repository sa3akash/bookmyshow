"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Building2,
  Calendar,
  Ticket,
  CreditCard,
  Tag,
  Users,
  PieChart,
  Shield,
  Settings,
  Activity,
  Search,
  Sparkles,
} from "lucide-react";
import { useCommandStore } from "@/stores/command.store";
import { useUIStore } from "@/stores/ui.store";

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandStore();
  const { theme, setTheme } = useUIStore();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    close();
  };

  const navItems = [
    { title: "Dashboard Overview", path: "/dashboard", icon: Sparkles, group: "Navigation" },
    { title: "Movies & Catalog", path: "/movies", icon: Film, group: "Management" },
    { title: "Venues & Theaters", path: "/venues", icon: Building2, group: "Management" },
    { title: "Show Schedules", path: "/shows", icon: Calendar, group: "Management" },
    { title: "Bookings", path: "/bookings", icon: Ticket, group: "Bookings" },
    { title: "Payments & Refunds", path: "/payments", icon: CreditCard, group: "Finance" },
    { title: "Coupons & Discounts", path: "/coupons", icon: Tag, group: "Marketing" },
    { title: "Users & Customers", path: "/users", icon: Users, group: "Users" },
    { title: "Analytics Overview", path: "/analytics/overview", icon: PieChart, group: "Analytics" },
    { title: "Roles & Permissions", path: "/roles", icon: Shield, group: "Security" },
    { title: "System Health & Queues", path: "/system/health", icon: Activity, group: "System" },
    { title: "Application Settings", path: "/settings", icon: Settings, group: "System" },
  ];

  const filtered = navItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-background/80 backdrop-blur-sm p-4">
      <div
        className="fixed inset-0"
        onClick={close}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden z-10 animate-in fade-in duration-200">
        <div className="flex items-center px-3.5 border-b border-border/80 bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground mr-2.5" />
          <input
            type="text"
            placeholder="Search commands, pages, users, bookings... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3.5 text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching admin commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium hover:bg-accent/60 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-t border-border/80 text-[11px] text-muted-foreground">
          <span>Press ↑↓ to navigate</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:text-foreground underline cursor-pointer"
          >
            Toggle Theme ({theme.toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
}
