"use client";

import React from "react";
import { User, Mail, Phone, MapPin, ShieldCheck, Bell, Sparkles } from "lucide-react";
import { useLocationStore } from "@/stores/location.store";

export default function CustomerProfilePage() {
  const { activeCity, openLocationModal } = useLocationStore();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#090c14] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white font-black text-2xl shadow-xl shadow-rose-500/25">
            JS
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Jahid Hasan</h1>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                VIP MOVIE CLUB
              </span>
            </div>
            <p className="text-xs text-slate-400">Member since August 2026 • 12 Movies Attended</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-300">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <Mail className="h-4 w-4 text-rose-500" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Email</span>
              <p className="font-bold text-white">jahid@example.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <Phone className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Phone</span>
              <p className="font-bold text-white">+880 1712-345678</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-amber-500" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Location</span>
                <p className="font-bold text-white">{activeCity.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openLocationModal}
              className="text-[11px] font-bold text-rose-400 hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
