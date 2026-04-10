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
          className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Inserat erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item as Item} />
      ))}
    </div>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  const { q, category, sort } = searchParams;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Leihen statt kaufen.
          </h1>
          <p className="mb-6 text-gray-500">
            Entdecke Werkzeug, Zelte, Instrumente und mehr – von Menschen in
            deiner Nachbarschaft.
          </p>
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* Filter + Sortierung */}
      <div className="sticky top-14 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Suspense>
                <CategoryChips />
              </Suspense>
            </div>
            <Suspense>
              <SortSelect defaultValue={sort ?? "newest"} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Ergebnisse */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {q && (
          <p className="mb-4 text-sm text-gray-500">
            Ergebnisse für <span className="font-medium text-gray-900">&bdquo;{q}&ldquo;</span>
          </p>
        )}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-gray-200 aspect-[4/3]" />
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
