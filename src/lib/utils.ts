import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in cents → "$1,234,567" or "$4,500/mo" */
export function formatPrice(cents: number, type: "SALE" | "RENT"): string {
  const dollars = cents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
  return type === "RENT" ? `${formatted}/mo` : formatted;
}

/** Format distance in miles */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(2)} mi`;
}

/** Denomination display labels */
export const DENOMINATION_LABELS: Record<string, string> = {
  ORTHODOX: "Orthodox",
  MODERN_ORTHODOX: "Modern Orthodox",
  CONSERVATIVE: "Conservative",
  REFORM: "Reform",
  RECONSTRUCTIONIST: "Reconstructionist",
  SEPHARDIC: "Sephardic",
  CHABAD: "Chabad",
  OTHER: "Other",
};

/** Denomination badge colors */
export const DENOMINATION_COLORS: Record<string, string> = {
  ORTHODOX: "bg-blue-100 text-blue-800",
  MODERN_ORTHODOX: "bg-indigo-100 text-indigo-800",
  CONSERVATIVE: "bg-purple-100 text-purple-800",
  REFORM: "bg-green-100 text-green-800",
  RECONSTRUCTIONIST: "bg-teal-100 text-teal-800",
  SEPHARDIC: "bg-amber-100 text-amber-800",
  CHABAD: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
};
