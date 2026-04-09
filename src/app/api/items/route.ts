import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { itemSchema } from "@/lib/validations/item";
import type { Category } from "@/types";

// GET /api/items – Suche & Listenansicht
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") as Category | null;
  const maxPrice = searchParams.get("max_price");
  const sort = searchParams.get("sort") ?? "newest";

  let query = supabase
    .from("items")
    .select("*, owner:users(id, name, avatar_url, location, rating, review_count)")
    .eq("is_active", true);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
    );
  }
  if (category) query = query.eq("category", category);
  if (maxPrice) {
    query = query.or(
      `price_per_day.lte.${maxPrice},price_per_day.is.null`
    );
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

  const { data, error } = await query.limit(48);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

// POST /api/items – Neues Inserat erstellen
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = itemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierungsfehler", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      owner_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      price_per_day: parsed.data.price_per_day ?? null,
      deposit: parsed.data.deposit ?? null,
      location: parsed.data.location,
      images: body.images ?? [],
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
