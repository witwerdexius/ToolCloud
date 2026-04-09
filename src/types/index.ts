// ─── Datenmodell-Typen (spiegelt das Supabase-Schema wider) ───────────────────

export type Category =
  | "werkzeug"
  | "camping"
  | "musik"
  | "sport"
  | "foto_video"
  | "kueche"
  | "garten"
  | "party";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  location?: string;
  description?: string;
  rating: number;
  review_count: number;
  created_at: string;
  verified: boolean;
}

export interface Item {
  id: string;
  owner_id: string;
  owner?: User;
  title: string;
  description: string;
  category: Category;
  images: string[];
  price_per_day?: number;   // null = kostenlos
  deposit?: number;
  is_active: boolean;
  location: string;
  lat?: number;
  lng?: number;
  rating: number;
  review_count: number;
  created_at: string;
}

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "rejected"
  | "cancelled";

export interface Booking {
  id: string;
  item_id: string;
  item?: Item;
  borrower_id: string;
  borrower?: User;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  message?: string;
  total_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer?: User;
  reviewed_user_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

// ─── API / Form Typen ──────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string;
  category?: Category;
  location?: string;
  radius_km?: number;
  max_price?: number;
  available_from?: string;
  available_to?: string;
  sort_by?: "distance" | "price_asc" | "rating" | "newest";
}
