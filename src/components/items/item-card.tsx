import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Item } from "@/types";
import type { Category } from "@/types";

const CATEGORY_BG: Record<Category, string> = {
  werkzeug:  "#E8F5F0",
  camping:   "#EFF6FF",
  musik:     "#FDF4FF",
  sport:     "#F0FDF4",
  foto_video:"#FFF7ED",
  kueche:    "#FFFBEB",
  garten:    "#FFF1F2",
  party:     "#FEF3C7",
};

interface ItemCardProps {
  item: Item;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ color: "#F59E0B", fontSize: 14, display: "flex", alignItems: "center", gap: 3 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#9CA3AF", fontSize: 12 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #F3F4F6",
        overflow: "hidden",
        cursor: "pointer",
        display: "block",
        textDecoration: "none",
        transition: "transform .2s, box-shadow .2s",
      }}
      className="item-card-hover"
    >
      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 168,
          background: item.images?.length > 0 ? "#E5E7EB" : (CATEGORY_BG[item.category] ?? "#E5E7EB"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          position: "relative",
        }}
      >
        {item.images?.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <span>{CATEGORY_ICONS[item.category]}</span>
        )}
        {/* Availability badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: item.is_active ? "#E8F5F0" : "#F3F4F6",
            color: item.is_active ? "#2E7D62" : "#9CA3AF",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {item.is_active ? "Verfügbar" : "Inaktiv"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "#111827" }}>
          {item.title}
        </div>
        {item.location && (
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {item.location}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2E7D62" }}>
            {formatPrice(item.price_per_day)}
            {item.price_per_day ? (
              <span style={{ fontSize: 12, fontWeight: 400, color: "#9CA3AF" }}> / Tag</span>
            ) : null}
          </div>
          {item.review_count > 0 && (
            <StarRating rating={item.rating} />
          )}
        </div>
      </div>
    </Link>
  );
}
