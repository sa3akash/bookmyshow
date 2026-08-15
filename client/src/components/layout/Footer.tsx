import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, HelpCircle, PhoneCall, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#04060a] text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800/80 pb-8">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">100% Authentic Booking</h4>
              <p className="text-[11px] text-slate-500">Real-time seat holds and instant digital QR tickets.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Secure Payment Gateway</h4>
              <p className="text-[11px] text-slate-500">Supports bKash, Nagad, Cards & Mobile Banking.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">24/7 Customer Support</h4>
              <p className="text-[11px] text-slate-500">Dedicated helpdesk for ticket queries & refunds.</p>
            </div>
          </div>
        </div>

        {/* Links Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Movies & Formats</h5>
            <ul className="space-y-2">
              <li><Link href="/movies" className="hover:text-white">Now Showing Movies</Link></li>
              <li><Link href="/movies" className="hover:text-white">Coming Soon Releases</Link></li>
              <li><Link href="/movies" className="hover:text-white">IMAX 3D Movies</Link></li>
              <li><Link href="/movies" className="hover:text-white">4DX Motion Experience</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Cinemas & Cities</h5>
            <ul className="space-y-2">
              <li><Link href="/cinemas" className="hover:text-white">Cinemas in Dhaka</Link></li>
              <li><Link href="/cinemas" className="hover:text-white">Cinemas in Chattogram</Link></li>
              <li><Link href="/cinemas" className="hover:text-white">Star Cineplex Branches</Link></li>
              <li><Link href="/cinemas" className="hover:text-white">Blockbuster Cinemas</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Offers & Coupons</h5>
            <ul className="space-y-2">
              <li><Link href="/offers" className="hover:text-white">bKash Cashback Offers</Link></li>
              <li><Link href="/offers" className="hover:text-white">Card Discount Promos</Link></li>
              <li><Link href="/offers" className="hover:text-white">Student Combo Deals</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Help & Account</h5>
            <ul className="space-y-2">
              <li><Link href="/bookings" className="hover:text-white">My Bookings</Link></li>
              <li><Link href="/profile" className="hover:text-white">Account Settings</Link></li>
              <li><Link href="/offers" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/offers" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 text-[11px] text-slate-500">
          <p>© 2026 BookMyShow Client Portal. All Rights Reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for Movie Enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
