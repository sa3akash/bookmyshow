"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Building2, Ticket, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "Cinemas", href: "/cinemas", icon: Building2 },
    { label: "Bookings", href: "/bookings", icon: Ticket },
    { label: "Account", href: "/profile", icon: User },
  ];

  // Hide on booking flow pages to leave maximum screen space for seat map & checkout
  if (pathname.startsWith("/booking/")) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-[#07090e]/95 backdrop-blur-xl px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold transition-all ${
                active ? "text-rose-500" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-rose-500 scale-110" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
