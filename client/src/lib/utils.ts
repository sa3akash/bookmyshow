import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencySymbol = "৳"): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currencySymbol}0`;
  }
  const formatted = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

export function formatDateString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}
