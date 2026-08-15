"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface SeatHoldTimerProps {
  expiresAt: string | null;
  onExpire?: () => void;
}

export function SeatHoldTimer({ expiresAt, onExpire }: SeatHoldTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(600); // 10 mins default fallback

  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diffSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));
      setSecondsLeft(diffSeconds);

      if (diffSeconds <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isLowTime = secondsLeft < 120;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 shadow-lg transition-all ${
        isLowTime
          ? "border-rose-500/60 bg-rose-500/10 text-rose-300 animate-pulse"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-bold">
        {isLowTime ? (
          <AlertTriangle className="h-4 w-4 text-rose-500" />
        ) : (
          <Clock className="h-4 w-4 text-amber-400" />
        )}
        <span>Seats locked for you</span>
      </div>

      <div className="font-mono text-sm font-black tracking-widest text-white bg-black/40 px-3 py-1 rounded-xl border border-white/10">
        {formattedTime}
      </div>
    </div>
  );
}
