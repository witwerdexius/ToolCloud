import type { Category, BookingStatus } from "@/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  werkzeug:  "Werkzeug",
  camping:   "Camping",
  musik:     "Musik",
  sport:     "Sport",
  foto_video:"Foto & Video",
  kueche:    "Küche",
  garten:    "Garten",
  party:     "Party & Events",
  sonstiges: "Sonstiges",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  werkzeug:  "🔧",
  camping:   "🏕️",
  musik:     "🎵",
  sport:     "🚲",
  foto_video:"📷",
  kueche:    "🍳",
  garten:    "🌿",
  party:     "🎉",
  sonstiges: "📦",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested:  "Angefragt",
  confirmed:  "Bestätigt",
  completed:  "Abgeschlossen",
  rejected:   "Abgelehnt",
  cancelled:  "Storniert",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};
