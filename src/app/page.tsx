import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ItemCard } from "@/components/items/item-card";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryChips } from "@/components/search/category-chips";
import { SortSelect } from "@/components/search/sort-select";
import type { Item } from "@/types";
import type { Category } from "@/types";

interface HomePageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
  };
}

async function ItemGrid({ q, category, sort }: { q?: string; category?: string; sort?: string }) {
  const supabase = createClient();

  let query = supabase
    .from("items")
    .select("*, owner:users(id, name, avatar_url, location, rating, review_count)")
    .eq("is_active", true);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
    );
  }

  if (category) {
    query = query.eq("category", category as Category);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price_per_day", { ascending: true, nullsFirst: true });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.limit(48);

  const { data: items, error } = await query;

  if (error) {
    return (
      <p className="py-12 text-center text-sm text-red-500">
        Fehler beim Laden der Inserate.
      </p>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-600 font-medium">Keine Inserate gefunden</p>
        <p className="text-sm text-gray-400 mt-1">
          {q
            ? `Keine Ergebnisse für „${q}"`
            : "Sei der Erste und stelle einen Gegenstand ein!"}
        </p>
        <Link
          href="/items/new"
          className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "#2E7D62" }}
        >
          Inserat erstellen
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item as Item} />
      ))}
    </div>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  const { q, category, sort } = searchParams;

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #2E7D62 0%, #3FA882 100%)", padding: "56px 24px 64px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Leihen statt kaufen.<br />Gemeinsam mehr.
        </h1>
        <p style={{ fontSize: 17, opacity: 0.88, marginBottom: 32 }}>
          Finde Gegenstände in deiner Nähe – von Menschen, denen du vertrauen kannst.
        </p>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Categories */}
      <div style={{ padding: "32px 24px 0", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Kategorien</div>
        <Suspense>
          <CategoryChips />
        </Suspense>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, padding: "0 24px", maxWidth: 960, margin: "24px auto 0", flexWrap: "wrap" }}>
        <select
          style={{ padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}
        >
          <option>📍 Umkreis: 10 km</option>
          <option>📍 Umkreis: 5 km</option>
          <option>📍 Umkreis: 25 km</option>
        </select>
        <select
          style={{ padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}
        >
          <option>💶 Alle Preise</option>
          <option>💶 Kostenlos</option>
          <option>💶 Bis 5 €/Tag</option>
          <option>💶 Bis 15 €/Tag</option>
        </select>
        <Suspense>
          <SortSelect defaultValue={sort ?? "newest"} />
        </Suspense>
      </div>

      {/* Items */}
      <div style={{ padding: "28px 24px 40px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {q ? (
              <>Ergebnisse für <span style={{ color: "#2E7D62" }}>„{q}"</span></>
            ) : (
              "Aktuelle Inserate"
            )}
          </div>
        </div>
        <Suspense
          fallback={
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ borderRadius: 12, background: "#E5E7EB", height: 260 }} />
              ))}
            </div>
          }
        >
          <ItemGrid q={q} category={category} sort={sort} />
        </Suspense>
      </div>
    </main>
  );
}
