import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Mein Profil – ToolCloud" };

export default async function ProfilePage() {
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

  const initials = profile.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Fetch user's items
  const { data: items } = await supabase
    .from("items")
    .select("id, title, category, price_per_day, is_active")
    .eq("owner_id", authUser.id)
    .order("created_at", { ascending: false });

  // Fetch bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, item:items(id, title, category)")
    .eq("renter_id", authUser.id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Profile header with green gradient */}
      <div style={{ background: "linear-gradient(135deg, #2E7D62 0%, #3FA882 100%)", padding: "36px 24px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            {/* Avatar */}
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
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{profile.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", marginTop: 4 }}>
                {profile.location && `📍 ${profile.location} · `}
                Mitglied seit {formatDate(profile.created_at)}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", marginTop: 4 }}>
                {profile.rating > 0 && `⭐ ${profile.rating.toFixed(1)} Bewertung · `}
                {profile.verified && "✓ E-Mail bestätigt"}
              </div>
            </div>
            <Link
              href="/profile/edit"
              style={{
                marginLeft: "auto",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                border: "2px solid rgba(255,255,255,.6)",
                background: "rgba(255,255,255,.1)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "background .15s",
              }}
            >
              Profil bearbeiten
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 28, marginTop: 20, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{bookings?.length ?? 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Ausgeliehen</div>
            </div>
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{items?.length ?? 0}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Verliehen</div>
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
          <TabLink label="Meine Buchungen" href="/profile" active />
          <TabLink label="Meine Inserate" href="/profile?tab=items" />
          <TabLink label="Bewertungen" href="/profile?tab=reviews" />
        </div>

        {/* Bookings list */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Aktive &amp; vergangene Buchungen</div>
            <select
              style={{ padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}
            >
              <option>Alle</option>
              <option>Aktiv</option>
              <option>Abgeschlossen</option>
              <option>Angefragt</option>
            </select>
          </div>

          {bookings && bookings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                padding: 40,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                Buchungen erscheinen hier, sobald du etwas ausgeliehen hast.
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#2E7D62",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Jetzt entdecken
              </Link>
            </div>
          )}
        </div>

        {/* My Items section */}
        {items && items.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Meine Inserate</div>
              <Link
                href="/items/new"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#2E7D62",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                + Inserat hinzufügen
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {items.map((item) => (
                <MyItemCard key={item.id} item={item} />
              ))}
              {/* Add item button */}
              <Link
                href="/items/new"
                style={{
                  background: "#fff",
                  border: "2px dashed #D1D5DB",
                  borderRadius: 12,
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: "#9CA3AF",
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "all .15s",
                }}
                className="add-item-hover"
              >
                <span style={{ fontSize: 32 }}>+</span>
                <span>Inserat hinzufügen</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TabLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        color: active ? "#2E7D62" : "#9CA3AF",
        border: "none",
        background: "none",
        borderBottom: active ? "2px solid #2E7D62" : "2px solid transparent",
        marginBottom: -2,
        transition: "color .15s, border-color .15s",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: "Angefragt",    bg: "#FEF3C7", color: "#B45309" },
    confirmed: { label: "Bestätigt",    bg: "#E8F5F0", color: "#2E7D62" },
    active:    { label: "Aktiv",        bg: "#E8F5F0", color: "#2E7D62" },
    completed: { label: "Abgeschlossen", bg: "#E8F5F0", color: "#2E7D62" },
    cancelled: { label: "Abgelehnt",    bg: "#FEE2E2", color: "#EF4444" },
    rejected:  { label: "Abgelehnt",    bg: "#FEE2E2", color: "#EF4444" },
  };
  const status = statusMap[booking.status] ?? { label: booking.status, bg: "#F3F4F6", color: "#6B7280" };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: 16,
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          background: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {booking.item?.category ? "📦" : "📦"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "#111827" }}>
          {booking.item?.title ?? "Unbekannter Gegenstand"}
        </div>
        <div style={{ fontSize: 13, color: "#9CA3AF" }}>
          {booking.start_date} – {booking.end_date}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            display: "block",
            background: status.bg,
            color: status.color,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          {status.label}
        </span>
        {booking.total_price ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2E7D62" }}>
            {booking.total_price} €
          </div>
        ) : (
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>—</div>
        )}
      </div>
    </div>
  );
}

function MyItemCard({ item }: { item: any }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ height: 120, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
        📦
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#111827" }}>{item.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              background: item.is_active ? "#E8F5F0" : "#FEF3C7",
              color: item.is_active ? "#2E7D62" : "#B45309",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {item.is_active ? "Verfügbar" : "Inaktiv"}
          </span>
          {item.price_per_day ? (
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
              {item.price_per_day} € / Tag
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Kostenlos</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
        <Link
          href={`/items/${item.id}/edit`}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            background: "#F3F4F6",
            color: "#374151",
            textDecoration: "none",
          }}
        >
          Bearbeiten
        </Link>
      </div>
    </div>
  );
}
