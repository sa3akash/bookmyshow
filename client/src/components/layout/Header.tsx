"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  MapPin,
  Search,
  ChevronDown,
  Ticket,
  Heart,
  User,
  Sparkles,
  Menu,
  X,
  Tag,
} from "lucide-react";
import { useLocationStore } from "@/stores/location.store";

export function Header() {
  const pathname = usePathname();
  const { activeCity, openLocationModal } = useLocationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Movies", href: "/movies" },
    { name: "Cinemas", href: "/cinemas" },
    { name: "Offers", href: "/offers" },
    { name: "My Bookings", href: "/bookings" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-xl shadow-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Location Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-all">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white group-hover:text-rose-400 transition-colors">
                Book<span className="text-rose-500">My</span>Show
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
                CINEMA & EVENTS
              </span>
            </div>
          </Link>

          {/* Location Selector Button */}
          <button
            type="button"
            onClick={openLocationModal}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all shadow-sm"
          >
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span>{activeCity.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for Movies, Cinemas, Genres, Languages..."
              className="w-full rounded-full border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Right Nav Links & Actions */}
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-4 text-xs font-bold">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    active ? "text-rose-500 border-b-2 border-rose-500" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* User Account / Profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition-all"
          >
            <User className="h-3.5 w-3.5 text-rose-400" />
            <span>Account</span>
          </Link>
        </div>

        {/* Mobile Hamburger & Location Selector */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={openLocationModal}
            className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200"
          >
            <MapPin className="h-3 w-3 text-rose-500" />
            <span>{activeCity.name}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#090c14] p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Movies, Cinemas..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white"
            />
          </div>

          <div className="flex flex-col space-y-2 text-sm font-bold text-slate-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-800/50 hover:text-rose-400"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-rose-400 font-bold"
            >
              Account & Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
