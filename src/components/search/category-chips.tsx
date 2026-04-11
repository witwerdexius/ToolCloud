"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/types";

export function CategoryChips() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") as Category | null;

  function handleClick(cat: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === cat) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
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
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          style={activeCategory === cat ? chipActive : chipBase}
        >
          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  );
}
