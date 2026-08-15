"use client";

import * as React from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Shield,
  Calendar as CalendarIcon,
  LogOut,
  User as UserIcon,
  Check,
  Sparkles,
  Settings,
  ShieldCheck,
  Layers,
  Film,
  Building2,
  DollarSign,
  Headphones,
} from "lucide-react";
import { useUIStore, DateRangePeriod } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useCommandStore } from "@/stores/command.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Role } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { setMobileSidebarOpen, theme, setTheme, dateRange, setDateRange } = useUIStore();
  const { user, updateRole, logout } = useAuthStore();
  const { open: openCommand } = useCommandStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showDateMenu, setShowDateMenu] = React.useState(false);

  // Click Outside Handler
  const dateRef = React.useRef<HTMLDivElement>(null);
  const notifyRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateLabels: Record<DateRangePeriod, string> = {
    today: "Today",
    yesterday: "Yesterday",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    this_month: "This Month",
    last_month: "Last Month",
    this_year: "This Year",
    custom: "Custom Range",
  };

  const roleGroups: { label: string; roles: Role[] }[] = [
    { label: "Executive & Admin", roles: ["SUPER_ADMIN", "ADMIN"] },
    { label: "Operations & Cinema", roles: ["MOVIE_MANAGER", "VENUE_MANAGER", "SHOW_MANAGER", "BOOKING_MANAGER"] },
    { label: "Finance & Audit", roles: ["PAYMENT_MANAGER", "FINANCE_MANAGER", "AUDITOR", "ANALYST"] },
    { label: "Marketing & Support", roles: ["MARKETING_MANAGER", "CUSTOMER_SUPPORT"] },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-card border-b border-border/80 px-4 md:px-6 flex items-center justify-between gap-4 shadow-sm transition-all">
      {/* Left Section: Mobile Drawer Toggle & Command Palette Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden h-9 w-9 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-all"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={openCommand}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-accent/70 hover:border-primary/40 text-xs text-muted-foreground transition-all cursor-pointer w-48 sm:w-72 shadow-xs group"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="truncate group-hover:text-foreground transition-colors">Search movies, venues, screens...</span>
          <kbd className="hidden sm:inline-flex h-4 items-center rounded border border-border/80 bg-card px-1.5 font-mono text-[9px] font-bold text-muted-foreground ml-auto shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Section: Date Context, Notifications, Theme Toggle & User Menu */}
      <div className="flex items-center gap-2.5">
        {/* 1. Date Context Range Dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => {
              setShowDateMenu(!showDateMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
              showDateMenu
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                : "border-border/80 bg-muted/30 hover:bg-accent text-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline font-bold">{dateLabels[dateRange]}</span>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", showDateMenu && "rotate-180")} />
          </button>

          {showDateMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border-2 border-border/90 bg-card p-2 shadow-2xl z-100 bg-[#121212] animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                Analytics Time Horizon
              </div>
              {(Object.keys(dateLabels) as DateRangePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setDateRange(period);
                    setShowDateMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between",
                    dateRange === period
                      ? "bg-primary text-primary-foreground font-extrabold shadow-sm"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  <span>{dateLabels[period]}</span>
                  {dateRange === period && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Notifications Dropdown */}
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDateMenu(false);
              setShowProfileMenu(false);
            }}
            className={cn(
              "relative h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs",
              showNotifications
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                : "border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-background animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border-2 border-border/90 bg-[#121212] p-4 shadow-2xl z-100 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="font-extrabold text-xs text-foreground">Notifications & Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-extrabold text-[10px]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/60" />
                    <span>No unread notifications</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={cn(
                        "p-3 rounded-xl border text-xs transition-all cursor-pointer space-y-1",
                        item.read
                          ? "border-border/40 bg-muted/10 opacity-70"
                          : "border-primary/30 bg-primary/5 font-semibold shadow-2xs hover:border-primary/60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">{item.title}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Dark/Light Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
          title="Toggle UI Theme Mode"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* 4. User Profile & Role Switcher Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowDateMenu(false);
              setShowNotifications(false);
            }}
            className={cn(
              "flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all cursor-pointer shadow-xs",
              showProfileMenu
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/80 bg-muted/30 hover:bg-accent"
            )}
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
              {user?.name?.[0] || "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-extrabold leading-tight text-foreground">{user?.name || "Shakil Ahmed"}</span>
              <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">
                {user?.role || "SUPER_ADMIN"}
              </span>
            </div>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground hidden sm:inline transition-transform duration-200", showProfileMenu && "rotate-180")} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border-2 border-border/90 bg-card p-4 shadow-2xl z-100 bg-[#121212] animate-in fade-in zoom-in-95 duration-150 space-y-4">
              {/* User Bio Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-md">
                  {user?.name?.[0] || "A"}
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-black text-foreground">{user?.name || "Shakil Ahmed"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || "admin@bookmyshow.com"}</p>
                  <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> Active {user?.role || "SUPER_ADMIN"} Session
                  </div>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Switch Role Persona</span>
                  <Shield className="h-3 w-3 text-primary" />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {roleGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest block px-1">
                        {group.label}
                      </span>
                      {group.roles.map((role) => {
                        const isSelected = user?.role === role;
                        return (
                          <button
                            key={role}
                            onClick={() => {
                              updateRole(role);
                              setShowProfileMenu(false);
                            }}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-xs font-black"
                                : "hover:bg-accent text-foreground"
                            )}
                          >
                            <span>{role}</span>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions & Sign Out */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <a
                  href="/settings"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </a>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
