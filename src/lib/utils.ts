import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

// ─── Tailwind-Klassen zusammenführen ──────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Preis formatieren ────────────────────────────────────────────────────────
export function formatPrice(price?: number): string {
  if (!price) return "Kostenlos";
  return `${price.toFixed(2).replace(".", ",")} €`;
}

// ─── Datum formatieren ────────────────────────────────────────────────────────
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "d. MMMM yyyy", { locale: de });
}

// ─── Buchungsgesamtpreis berechnen ────────────────────────────────────────────
export function calcTotalPrice(
  pricePerDay: number | undefined,
  startDate: string,
  endDate: string,
  deposit: number = 0,
  serviceFee: number = 1
): {
  days: number;
  rentalCost: number;
  deposit: number;
  serviceFee: number;
  total: number;
} {
  const days = differenceInDays(parseISO(endDate), parseISO(startDate));
  const rentalCost = (pricePerDay ?? 0) * days;
  const effectiveServiceFee = rentalCost > 0 ? serviceFee : 0;
  const total = rentalCost + deposit + effectiveServiceFee;

  return { days, rentalCost, deposit, serviceFee: effectiveServiceFee, total };
}

// ─── Sterne-Array ─────────────────────────────────────────────────────────────
export function getStars(rating: number): ("full" | "half" | "empty")[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return "full";
    if (i < rating) return "half";
    return "empty";
  });
}
