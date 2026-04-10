"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/types";

export function CategoryChips() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") as Category | null;

  function buildUrl(category: Category | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    return `/?${params.toString()}`;
  }

  const chipBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1.5px solid #E5E7EB",
    padding: "10px 16px",
    borderRadius: 30,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    transition: "all .15s",
    whiteSpace: "nowrap",
    textDecoration: "none",
    flexShrink: 0,
  };

  const chipActive: React.CSSProperties = {
    ...chipBase,
    borderColor: "#2E7D62",
    color: "#2E7D62",
    background: "#E8F5F0",
  };

  return (
    <div
      className="category-chips-container scrollbar-none"
      style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
    >
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={buildUrl(cat)}
          style={activeCategory === cat ? chipActive : chipBase}
        >
          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
        </Link>
      ))}
    </div>
  );
}
