import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";
import { CATEGORY_ICONS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/constants";
import type { BookingStatus, Category } from "@/types";
import { ToggleActiveButton } from "@/components/items/toggle-active-button";

export const metadata = { title: "Mein Profil – ToolCloud" };

interface ProfilePageProps {
  searchParams: { tab?: string };
}

type ActiveTab = "bookings" | "items" | "reviews";

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/auth/login");

  const activeTab: ActiveTab =
    searchParams.tab === "items" ? "items"
    : searchParams.tab === "reviews" ? "reviews"
    : "bookings";

  const initials = profile.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const today = new Date().toISOString().split("T")[0];
  const vacationActive =
    profile.vacation_start &&
    profile.vacation_end &&
    today >= profile.vacation_start &&
    today <= profile.vacation_end;

  // Fetch user's items
  const { data: items } = await supabase
    .from("items")
    .select("id, title, category, price_per_day, is_active, images")
    .eq("owner_id", authUser.id)
    .order("created_at", { ascending: false });

  // A1 Fix: borrower_id (nicht renter_id)
  // A2 Fix: item-Select mit images für Icon-Anzeige
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, start_date, end_date, total_price, item:items(id, title, category, images)")
    .eq("borrower_id", authUser.id)
    .order("created_at", { ascending: false });

  // Bewertungen über den Nutzer
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer:users(id, name)")
    .eq("reviewed_user_id", authUser.id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Profile header */}
      <div style={{ background: "linear-gradient(135deg, #2E7D62 0%, #3FA882 100%)", padding: "36px 24px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {/* Top: Avatar, Name, Button, Meta – zentriert */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                border: "3px solid rgba(255,255,255,.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile.name}</div>
            <Link
              href="/profile/edit"
              style={{
                padding: "10px 24px", borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: "#fff",
                border: "2px solid rgba(255,255,255,.6)",
                background: "rgba(255,255,255,.1)", textDecoration: "none",
              }}
            >
              Profil bearbeiten
            </Link>
            {vacationActive && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(251,191,36,.25)", border: "1px solid rgba(251,191,36,.5)",
                borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: "#FEF3C7",
              }}>
                🏖️ Urlaubsmodus aktiv bis {formatDate(profile.vacation_end!)}
              </div>
            )}
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)" }}>
              {profile.location ? `📍 ${profile.location} · ` : ""}
              Mitglied seit {formatDate(profile.created_at)}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 24 }}>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{bookings?.length ?? 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Ausgeliehen</div>
            </div>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{items?.length ?? 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Inserate</div>
            </div>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{items?.filter((i) => i.is_active).length ?? 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Aktive Inserate</div>
            </div>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {profile.rating > 0 ? `${profile.rating.toFixed(1)} ⭐` : "–"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Ø Bewertung</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard body */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #E5E7EB" }}>
          <TabLink label="Meine Buchungen" href="/profile" active={activeTab === "bookings"} dot={(bookings?.some((b) => b.status === "requested")) ?? false} />
          <TabLink label="Meine Inserate" href="/profile?tab=items" active={activeTab === "items"} />
          <TabLink label="Bewertungen" href="/profile?tab=reviews" active={activeTab === "reviews"} />
        </div>

        {/* Tab: Buchungen */}
        {activeTab === "bookings" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Aktive &amp; vergangene Buchungen</div>
            </div>

            {bookings && bookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                  Buchungen erscheinen hier, sobald du etwas ausgeliehen hast.
                </p>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    marginTop: 16, padding: "10px 20px", borderRadius: 8,
                    fontSize: 14, fontWeight: 600,
                    background: "#2E7D62", color: "#fff", textDecoration: "none",
                  }}
                >
                  Jetzt entdecken
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Inserate */}
        {activeTab === "items" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Meine Inserate</div>
              <Link
                href="/items/new"
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: "#2E7D62", color: "#fff", textDecoration: "none",
                }}
              >
                + Inserat hinzufügen
              </Link>
            </div>

            {items && items.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {items.map((item) => (
                  <MyItemCard key={item.id} item={item} />
                ))}
                <Link
                  href="/items/new"
                  style={{
                    background: "#fff", border: "2px dashed #D1D5DB", borderRadius: 12,
                    minHeight: 200, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 8, cursor: "pointer", color: "#9CA3AF",
                    fontSize: 14, textDecoration: "none", transition: "all .15s",
                  }}
                  className="add-item-hover"
                >
                  <span style={{ fontSize: 32 }}>+</span>
                  <span>Inserat hinzufügen</span>
                </Link>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#9CA3AF" }}>Du hast noch keine Inserate erstellt.</p>
                <Link
                  href="/items/new"
                  style={{
                    display: "inline-flex", marginTop: 16, padding: "10px 20px",
                    borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: "#2E7D62", color: "#fff", textDecoration: "none",
                  }}
                >
                  Erstes Inserat erstellen
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Bewertungen */}
        {activeTab === "reviews" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
              Bewertungen über mich
            </div>

            {reviews && reviews.length > 0 ? (
              <div>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#9CA3AF" }}>Noch keine Bewertungen vorhanden.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Sub-Komponenten ────────────────────────────────────────────────────────

function TabLink({ label, href, active, dot }: { label: string; href: string; active: boolean; dot?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 18px", fontSize: 14, fontWeight: 600,
        color: active ? "#2E7D62" : "#9CA3AF",
        borderBottom: active ? "2px solid #2E7D62" : "2px solid transparent",
        marginBottom: -2, transition: "color .15s, border-color .15s",
        textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >
      {label}
      {dot && (
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
      )}
    </Link>
  );
}

type BookingItemData = {
  id: string;
  title: string;
  category: string;
  images: string[];
} | null;

type BookingRowData = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_price: number | null;
  item: BookingItemData | BookingItemData[];
};

function BookingRow({ booking }: { booking: BookingRowData }) {
  const statusKey = booking.status as BookingStatus;
  const label = BOOKING_STATUS_LABELS[statusKey] ?? booking.status;
  const colorClass = BOOKING_STATUS_COLORS[statusKey] ?? "bg-gray-100 text-gray-500";

  // Supabase kann Join als Array liefern
  const itemData = Array.isArray(booking.item) ? booking.item[0] : booking.item;

  // A3 Fix: Kategorie-Icon aus CATEGORY_ICONS
  const icon = itemData?.category
    ? (CATEGORY_ICONS[itemData.category as Category] ?? "📦")
    : "📦";

  return (
    <div
      style={{
        background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: 16, display: "flex", gap: 16, alignItems: "center",
      }}
    >
      <div
        style={{
          width: 52, height: 52, borderRadius: 10,
          background: "#F3F4F6", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 26, flexShrink: 0, overflow: "hidden",
        }}
      >
        {itemData?.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={itemData.images[0]}
            alt={itemData.title ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          icon
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "#111827" }}>
          {itemData?.title ?? "Unbekannter Gegenstand"}
        </div>
        {/* A3 Fix: formatDate statt ISO-String */}
        <div style={{ fontSize: 13, color: "#9CA3AF" }}>
          {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span className={`${colorClass} block mb-1.5 text-center px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
          {label}
        </span>
        {booking.total_price ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2E7D62" }}>
            {formatPrice(booking.total_price)}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>—</div>
        )}
      </div>
    </div>
  );
}

type MyItemData = {
  id: string;
  title: string;
  category: string;
  price_per_day: number | null;
  is_active: boolean;
  images: string[];
};

function MyItemCard({ item }: { item: MyItemData }) {
  const icon = CATEGORY_ICONS[item.category as Category] ?? "📦";

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ height: 120, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, overflow: "hidden", position: "relative" }}>
        {item.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.images[0]}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          icon
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#111827" }}>{item.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              background: item.is_active ? "#E8F5F0" : "#FEF3C7",
              color: item.is_active ? "#2E7D62" : "#B45309",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}
          >
            {item.is_active ? "Verfügbar" : "Inaktiv"}
          </span>
          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
            {item.price_per_day ? `${item.price_per_day} € / Tag` : "Kostenlos"}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
        <Link
          href={`/items/${item.id}/edit`}
          style={{
            flex: 1, textAlign: "center", padding: "6px 12px", borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            background: "#F3F4F6", color: "#374151", textDecoration: "none",
          }}
        >
          Bearbeiten
        </Link>
        <ToggleActiveButton itemId={item.id} isActive={item.is_active} />
      </div>
    </div>
  );
}

type ReviewerData = { id: string; name: string } | null;

type ReviewData = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: ReviewerData | ReviewerData[];
};

function ReviewCard({ review }: { review: ReviewData }) {
  const reviewer = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer;

  const initials = reviewer?.name
    ? reviewer.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const avatarColors = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#F97316"];
  const colorIdx = reviewer?.name
    ? reviewer.name.charCodeAt(0) % avatarColors.length
    : 0;

  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: avatarColors[colorIdx],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {reviewer?.name ?? "Anonym"}
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            {formatDate(review.created_at)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", color: "#F59E0B", fontSize: 14 }}>
          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
        </div>
      </div>
      {review.comment && (
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{review.comment}</p>
      )}
    </div>
  );
}
