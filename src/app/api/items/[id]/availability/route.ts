import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params {
  params: { id: string };
}

// GET /api/items/[id]/availability
// Gibt gebuchte Zeiträume (requested/confirmed) + Eigentümer-Sperren zurück.
// Öffentlich zugänglich – kein Login nötig.
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const itemId = params.id;

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("start_date, end_date")
      .eq("item_id", itemId)
      .in("status", ["requested", "confirmed"]),

    supabase
      .from("item_availability")
      .select("id, start_date, end_date, note")
      .eq("item_id", itemId)
      .order("start_date", { ascending: true }),
  ]);

  if (bookingsRes.error) {
    return NextResponse.json({ error: bookingsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    booked: bookingsRes.data ?? [],
    blocked: blockedRes.data ?? [],
  });
}

// POST /api/items/[id]/availability
// Fügt eine neue Sperrzeit hinzu. Nur für den Eigentümer.
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const itemId = params.id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Eigentümer-Check
  const { data: item } = await supabase
    .from("items")
    .select("owner_id")
    .eq("id", itemId)
    .single();

  if (!item || item.owner_id !== user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await req.json();
  const { start_date, end_date, note } = body;

  if (!start_date || !end_date) {
    return NextResponse.json({ error: "start_date und end_date erforderlich" }, { status: 400 });
  }
  if (end_date < start_date) {
    return NextResponse.json({ error: "Enddatum muss nach Startdatum liegen" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("item_availability")
    .insert({ item_id: itemId, start_date, end_date, note: note ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ availability: data }, { status: 201 });
}

// DELETE /api/items/[id]/availability?availability_id=...
// Löscht eine Sperrzeit. Nur für den Eigentümer.
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createClient();
  const itemId = params.id;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { data: item } = await supabase
    .from("items")
    .select("owner_id")
    .eq("id", itemId)
    .single();

  if (!item || item.owner_id !== user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const availabilityId = req.nextUrl.searchParams.get("availability_id");
  if (!availabilityId) {
    return NextResponse.json({ error: "availability_id erforderlich" }, { status: 400 });
  }

  const { error } = await supabase
    .from("item_availability")
    .delete()
    .eq("id", availabilityId)
    .eq("item_id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
