"use client";

import * as React from "react";
import { Search, Bell, Sun, Moon, Laptop, Menu, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Shield, Calendar as CalendarIcon } from "lucide-react";
import { useUIStore, DateRangePeriod } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useCommandStore } from "@/stores/command.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Button } from "@/components/ui/button";
import { Role } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { setMobileSidebarOpen, theme, setTheme, dateRange, setDateRange } = useUIStore();
  const { user, updateRole } = useAuthStore();
  const { open: openCommand } = useCommandStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showDateMenu, setShowDateMenu] = React.useState(false);

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

  const availableRoles: Role[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "CONTENT_MANAGER",
    "MOVIE_MANAGER",
    "VENUE_MANAGER",
    "SHOW_MANAGER",
    "BOOKING_MANAGER",
    "PAYMENT_MANAGER",
    "FINANCE_MANAGER",
    "MARKETING_MANAGER",
    "CUSTOMER_SUPPORT",
    "ANALYST",
    "AUDITOR",
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border/80 px-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden h-9 w-9 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={openCommand}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-accent text-xs text-muted-foreground transition-all cursor-pointer w-48 sm:w-64"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">Search commands, pages...</span>
          <kbd className="hidden sm:inline-flex h-4 items-center rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground ml-auto">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Date selector, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2">
        {/* Date Context Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDateMenu(!showDateMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-accent text-xs font-medium text-foreground transition-colors cursor-pointer"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{dateLabels[dateRange]}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showDateMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card p-1 shadow-xl z-50 animate-in fade-in duration-150">
              {(Object.keys(dateLabels) as DateRangePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setDateRange(period);
                    setShowDateMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between",
                    dateRange === period ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent text-foreground"
                  )}
                >
                  {dateLabels[period]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 w-9 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="font-semibold text-xs text-foreground">Admin Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border/40 my-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">No active notifications</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={cn(
                        "p-2.5 rounded-lg text-xs transition-colors cursor-pointer my-1",
                        item.read ? "bg-card opacity-70" : "bg-accent/40 font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {user?.name?.[0] || "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">{user?.name}</span>
              <span className="text-[9px] font-bold text-primary uppercase">{user?.role}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:inline" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in duration-150">
              <div className="pb-2 border-b border-border/60">
                <p className="text-xs font-bold text-foreground">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              </div>

              <div className="py-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Switch Active Role (RBAC Demo)
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        updateRole(role);
                        setShowProfileMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-between",
                        user?.role === role ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent text-foreground"
                      )}
                    >
                      <span>{role}</span>
                      {user?.role === role && <Shield className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
