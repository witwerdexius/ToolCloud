import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/utils";
import { BookingForm } from "@/components/booking/booking-form";
import type { Item, User } from "@/types";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("title")
    .eq("id", params.id)
    .single();
  return { title: data ? `${data.title} – ToolCloud` : "Inserat – ToolCloud" };
}

export default async function ItemDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*, owner:users(id, name, avatar_url, location, rating, review_count, created_at, verified)")
    .eq("id", params.id)
    .single();

  if (!item) notFound();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isOwner = authUser?.id === item.owner_id;
  const owner = item.owner as User;

  const ownerInitials = owner?.name
    ? owner.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Back button */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#6B7280",
            fontSize: 14,
            cursor: "pointer",
            background: "none",
            border: "none",
            marginBottom: 20,
            padding: 0,
            textDecoration: "none",
            transition: "color .15s",
          }}
          className="back-btn-hover"
        >
          ← Zurück zur Suche
        </Link>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }} className="detail-grid-responsive">
          {/* Left column */}
          <div>
            {/* Gallery */}
            <div
              style={{
                background: "#F3F4F6",
                borderRadius: 12,
                height: 340,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 100,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {item.images?.length > 0 ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <span>{CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}</span>
              )}
            </div>

            {/* Thumbnails */}
            {item.images?.length > 1 && (
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {item.images.slice(0, 4).map((url: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      width: 72,
                      height: 56,
                      borderRadius: 8,
                      background: "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      cursor: "pointer",
                      border: i === 0 ? "2px solid #2E7D62" : "2px solid transparent",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div style={{ marginTop: 24 }}>
              {/* Meta row */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <span style={{ background: "#E8F5F0", color: "#2E7D62", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  ✓ Verfügbar
                </span>
                <span style={{ background: "#F3F4F6", color: "#6B7280", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}{" "}
                  {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                </span>
                {item.review_count > 0 && (
                  <div style={{ color: "#F59E0B", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                    ★★★★★
                    <strong style={{ marginLeft: 4, color: "#111827" }}>{item.rating.toFixed(1)}</strong>
                    <span style={{ color: "#9CA3AF", fontSize: 13 }}>({item.review_count} Bewertungen)</span>
                  </div>
                )}
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: "#111827" }}>{item.title}</h1>

              {item.location && (
                <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>📍 {item.location}</p>
              )}

              {item.description && (
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#374151", marginBottom: 20 }}>
                  {item.description}
                </p>
              )}

              {isOwner && (
                <Link
                  href={`/items/${item.id}/edit`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    background: "#F3F4F6",
                    color: "#374151",
                    textDecoration: "none",
                    marginBottom: 20,
                  }}
                >
                  Bearbeiten
                </Link>
              )}

              {/* Owner card */}
              {owner && (
                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#2E7D62",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {ownerInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{owner.name}</div>
                    <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                      {owner.review_count > 0 && `⭐ ${owner.rating.toFixed(1)} · `}
                      Mitglied seit {formatDate(owner.created_at)}
                    </div>
                  </div>
                  <Link
                    href="/messages"
                    style={{
                      marginLeft: "auto",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      background: "#F3F4F6",
                      color: "#374151",
                      textDecoration: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Nachricht
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right column – Booking box */}
          <div>
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: 24,
                position: "sticky",
                top: 80,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2E7D62", marginBottom: 4 }}>
                {formatPrice(item.price_per_day)}
                <span style={{ fontSize: 14, fontWeight: 400, color: "#9CA3AF" }}> / Tag</span>
              </div>
              {item.deposit && (
                <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
                  Kaution: {formatPrice(item.deposit)}
                </div>
              )}

              {isOwner ? (
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 16, textAlign: "center", fontSize: 14, color: "#6B7280" }}>
                  Das ist dein eigenes Inserat.
                </div>
              ) : authUser ? (
                <BookingForm item={item as Item} />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p style={{ marginBottom: 12, fontSize: 14, color: "#6B7280" }}>
                    Melde dich an, um eine Buchungsanfrage zu senden.
                  </p>
                  <Link
                    href={`/auth/login?next=/items/${item.id}`}
                    style={{
                      display: "block",
                      width: "100%",
                      borderRadius: 8,
                      background: "#2E7D62",
                      padding: "12px 0",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Anmelden
                  </Link>
                </div>
              )}

              {/* Availability hint */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Verfügbarkeit</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, background: "#E8F5F0", borderRadius: 2, marginRight: 4 }} />
                  Verfügbar
                  <span style={{ display: "inline-block", width: 10, height: 10, background: "#E5E7EB", borderRadius: 2, margin: "0 4px 0 12px" }} />
                  Belegt
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, marginTop: 8, textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>
                  Kalenderansicht folgt im nächsten Iteration
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
