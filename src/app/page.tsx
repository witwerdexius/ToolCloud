import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ItemCard } from "@/components/items/item-card";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryChips } from "@/components/search/category-chips";
import { SortSelect } from "@/components/search/sort-select";
import { FilterBar } from "@/components/search/filter-bar";
import type { Item } from "@/types";
import type { Category } from "@/types";

interface HomePageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    max_price?: string;
  };
}

async function ItemGrid({ q, category, sort, max_price }: { q?: string; category?: string; sort?: string; max_price?: string }) {
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

  if (max_price === "0") {
    query = query.is("price_per_day", null);
  } else if (max_price) {
    query = query.lte("price_per_day", Number(max_price));
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
    return <p style={{ textAlign: "center", padding: "48px 0", color: "#EF4444", fontSize: 14 }}>Fehler beim Laden der Inserate.</p>;
  }

  if (!items || items.length === 0) {
    return (
      <>
        {/* Section header – Leer-State */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {q ? <>Ergebnisse für <span style={{ color: "#2E7D62" }}>&bdquo;{q}&ldquo;</span></> : "Aktuelle Inserate"}
          </div>
        </div>
        <div style={{ paddingTop: 32, paddingBottom: 32, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>Keine Inserate gefunden</p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
            {q ? `Keine Ergebnisse für \u201e${q}\u201c` : "Sei der Erste und stelle einen Gegenstand ein!"}
          </p>
          <Link
            href="/items/new"
            style={{
              display: "inline-block", marginTop: 16, borderRadius: 10,
              padding: "10px 20px", fontSize: 14, fontWeight: 600,
              color: "#fff", background: "#2E7D62", textDecoration: "none",
            }}
          >
            Inserat erstellen
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Section header mit Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
          {q
            ? <>{items.length} Ergebnisse für <span style={{ color: "#2E7D62" }}>&bdquo;{q}&ldquo;</span></>
            : `${items.length} Inserate`}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item as Item} />
        ))}
      </div>
    </>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  const { q, category, sort, max_price } = searchParams;

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #2E7D62 0%, #3FA882 100%)",
        padding: "56px 24px 64px",
        textAlign: "center",
        color: "#fff",
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Leihen statt kaufen.<br />Gemeinsam mehr.
        </h1>
        <p style={{ fontSize: 17, opacity: 0.88, maxWidth: 680, margin: "0 auto 32px" }}>
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
      <div style={{ display: "flex", gap: 10, padding: "0 24px", maxWidth: 960, margin: "20px auto 0", flexWrap: "wrap" }}>
        <Suspense>
          <FilterBar />
        </Suspense>
        <Suspense>
          <SortSelect defaultValue={sort ?? "newest"} />
        </Suspense>
      </div>

      {/* Items */}
      <div style={{ padding: "28px 24px 40px", maxWidth: 960, margin: "0 auto" }}>
        <Suspense
          fallback={
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 160, height: 24, borderRadius: 6, background: "#E5E7EB" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ borderRadius: 12, background: "#E5E7EB", height: 260 }} />
                ))}
              </div>
            </>
          }
        >
          <ItemGrid q={q} category={category} sort={sort} max_price={max_price} />
        </Suspense>
      </div>
    </main>
  );
}
