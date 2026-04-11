import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { BookingActionButtons } from "@/components/booking/booking-action-buttons";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";

export const metadata = { title: "Buchungen – ToolCloud" };

export default async function BookingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/bookings");

  // Meine Anfragen (als Ausleiher)
  const { data: myRequests } = await supabase
    .from("bookings")
    .select("*, item:items(id, title, images, category, location, owner_id)")
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  // Eingehende Anfragen (als Vermieter)
  const { data: incomingRequests } = await supabase
    .from("bookings")
    .select(
      "*, item:items(id, title, images, category, location, owner_id), borrower:users(id, name)"
    )
    .eq("items.owner_id", user.id)
    .order("created_at", { ascending: false });

  // Alternativer Query für eingehende Anfragen via items
  const { data: myItems } = await supabase
    .from("items")
    .select("id")
    .eq("owner_id", user.id);

  const myItemIds = myItems?.map((i) => i.id) ?? [];

  const { data: incoming } = myItemIds.length
    ? await supabase
        .from("bookings")
        .select(
          "*, item:items(id, title, images, category, location), borrower:users(id, name)"
        )
        .in("item_id", myItemIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Buchungen</div>
        </div>

        {/* Meine Anfragen */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Meine Anfragen
          </div>
          {!myRequests || myRequests.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Du hast noch keine Buchungsanfragen gesendet.</p>
              <Link
                href="/"
                style={{ display: "inline-block", marginTop: 12, fontSize: 14, color: "#2E7D62", textDecoration: "none" }}
              >
                Inserate entdecken
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myRequests.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  viewAs="borrower"
                  currentUserId={user.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Eingehende Anfragen */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Eingehende Anfragen
          </div>
          {!incoming || incoming.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Noch keine Anfragen für deine Inserate.</p>
              <Link
                href="/items/new"
                style={{ display: "inline-block", marginTop: 12, fontSize: 14, color: "#2E7D62", textDecoration: "none" }}
              >
                Inserat erstellen
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {incoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  viewAs="owner"
                  currentUserId={user.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

type BookingCardItem = {
  id: string;
  title: string;
  images: string[];
  category: string;
  location: string;
} | null;

type BookingCardData = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  message: string | null;
  item: BookingCardItem;
  borrower: { id: string; name: string } | null;
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  requested:  { bg: "#FEF3C7", color: "#B45309" },
  confirmed:  { bg: "#E8F5F0", color: "#2E7D62" },
  completed:  { bg: "#E8F5F0", color: "#2E7D62" },
  rejected:   { bg: "#FEE2E2", color: "#EF4444" },
  cancelled:  { bg: "#F3F4F6", color: "#6B7280" },
};

function BookingCard({
  booking,
  viewAs,
}: {
  booking: BookingCardData;
  viewAs: "borrower" | "owner";
  currentUserId: string;
}) {
  const item = booking.item;
  const s = STATUS_STYLE[booking.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
  const statusBg = s.bg;
  const statusColor = s.color;
  const statusLabel =
    BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS] ??
    booking.status;

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Full-card link */}
      <Link
        href={`/items/${item?.id}`}
        aria-label={`Buchung für ${item?.title ?? "Inserat"} anzeigen`}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          zIndex: 1,
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
      />

      {/* Card content */}
      <div
        style={{
          padding: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Icon */}
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
            overflow: "hidden",
          }}
        >
          {item?.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt={item.title ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            "📦"
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
            {item?.title ?? "Inserat"}
          </div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>
            {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
          </div>
          {viewAs === "owner" && booking.borrower && (
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
              Von: {booking.borrower.name}
            </div>
          )}
          {booking.message && (
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              &bdquo;{booking.message}&ldquo;
            </div>
          )}
        </div>

        {/* Right: badge + action buttons — above the card link */}
        <div style={{ textAlign: "right", flexShrink: 0, position: "relative", zIndex: 2 }}>
          <span
            style={{
              display: "block",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 6,
              textAlign: "center",
              background: statusBg,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
          {viewAs === "owner" && booking.status === "requested" && (
            <BookingActionButtons bookingId={booking.id} />
          )}
          {viewAs === "owner" && (booking.status === "requested" || booking.status === "confirmed") && (
            <div style={{ marginTop: 4 }}>
              <CancelBookingButton bookingId={booking.id} />
            </div>
          )}
          {viewAs === "borrower" && (booking.status === "requested" || booking.status === "confirmed") && (
            <CancelBookingButton bookingId={booking.id} />
          )}
        </div>
      </div>
    </div>
  );
}
