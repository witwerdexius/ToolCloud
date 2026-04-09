import { NextRequest, NextResponse } from "next/server";
// import { createServerClientInstance } from "@/lib/supabase";

// GET /api/items – Suche & Listenansicht
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query    = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const lat      = searchParams.get("lat");
  const lng      = searchParams.get("lng");
  const radius   = searchParams.get("radius") ?? "10";
  const maxPrice = searchParams.get("max_price");

  // TODO Phase 1: Supabase-Query mit Filtern aufbauen

  return NextResponse.json({
    items: [],
    meta: { query, category, lat, lng, radius, maxPrice },
  });
}

// POST /api/items – Neues Inserat erstellen
export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO Phase 1: Auth-Check + Validierung (zod) + Supabase insert

  return NextResponse.json({ message: "Noch nicht implementiert" }, { status: 501 });
}
