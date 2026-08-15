"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Building2,
  Calendar,
  Ticket,
  CreditCard,
  Tag,
  Users,
  Shield,
  Settings,
  Activity,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  Layers,
  Megaphone,
  Sliders,
  DollarSign,
  PieChart,
  X,
} from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { can, Permission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
      ],
    },
    {
      title: "Management",
      items: [
        { title: "Movies & Catalog", href: "/movies", icon: Film, permission: "movie:view" },
        { title: "Venues & Theaters", href: "/venues", icon: Building2, permission: "venue:view" },
        { title: "Screen Capacity", href: "/screens", icon: Layers, permission: "screen:view" },
        { title: "Seat Editor", href: "/seats", icon: Sliders, permission: "seat:view", badge: "Studio" },
        { title: "Shows & Schedules", href: "/shows", icon: Calendar, permission: "show:view" },
      ],
    },
    {
      title: "Bookings",
      items: [
        { title: "All Bookings", href: "/bookings", icon: Ticket, permission: "booking:view" },
      ],
    },
    {
      title: "Payments & Finance",
      items: [
        { title: "Transactions", href: "/payments", icon: CreditCard, permission: "payment:view" },
        { title: "Refunds", href: "/refunds", icon: DollarSign, permission: "payment:refund" },
        { title: "Finance Summary", href: "/finance", icon: DollarSign, permission: "analytics:financial" },
      ],
    },
    {
      title: "Marketing",
      items: [
        { title: "Coupons", href: "/coupons", icon: Tag, permission: "coupon:view" },
        { title: "Campaigns & Offers", href: "/campaigns", icon: Megaphone, permission: "coupon:view" },
      ],
    },
    {
      title: "Users & Security",
      items: [
        { title: "Customers", href: "/users", icon: Users, permission: "user:view" },
        { title: "Admin Users", href: "/admins", icon: Shield, permission: "admin:view" },
        { title: "Roles & Permissions", href: "/roles", icon: Shield, permission: "role:view" },
        { title: "Audit Logs", href: "/audit", icon: History, permission: "audit:view" },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { title: "Analytics Overview", href: "/analytics/overview", icon: PieChart, permission: "analytics:view" },
        { title: "Scheduled Reports", href: "/reports", icon: FileText, permission: "report:view" },
      ],
    },
    {
      title: "System & Settings",
      items: [
        { title: "System Health", href: "/system/health", icon: Activity, permission: "settings:view" },
        { title: "Settings", href: "/settings", icon: Settings, permission: "settings:view" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r border-border/80 transition-all duration-300 flex flex-col justify-between shadow-2xl md:shadow-none",
          sidebarCollapsed ? "w-16" : "w-64",
          mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/80">
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md">
                  B
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-foreground leading-none">
                    BookMyShow
                  </span>
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-0.5">
                    Admin Console
                  </span>
                </div>
              </Link>
            )}
            {sidebarCollapsed && !mobileSidebarOpen && (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black mx-auto shadow-md">
                B
              </div>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-muted/40 hover:bg-accent transition-colors cursor-pointer text-muted-foreground"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden h-8 w-8 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)] p-2 space-y-4">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) => {
                if (!item.permission) return true;
                return can(user, item.permission);
              });
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1">
                  {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {section.title}
                    </h4>
                  )}
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer relative",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                        )}
                        title={sidebarCollapsed && !mobileSidebarOpen ? item.title : undefined}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                        {(!sidebarCollapsed || mobileSidebarOpen) && <span className="truncate">{item.title}</span>}
                        {(!sidebarCollapsed || mobileSidebarOpen) && item.badge && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User Role Info */}
        {(!sidebarCollapsed || mobileSidebarOpen) && (
          <div className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={user?.name || "User Avatar"}
                className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-foreground truncate">{user?.name || "Admin User"}</span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider truncate">
                  {user?.role ? user.role.replace("_", " ") : "SUPER ADMIN"}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
