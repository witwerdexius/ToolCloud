"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
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

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Link
        href={buildUrl(null)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
          !activeCategory
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        )}
      >
        Alle
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={buildUrl(cat)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            activeCategory === cat
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          )}
        >
          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
        </Link>
      ))}
    </div>
  );
}
