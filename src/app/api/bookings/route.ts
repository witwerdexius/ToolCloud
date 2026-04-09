import { NextRequest, NextResponse } from "next/server";

// POST /api/bookings – Buchungsanfrage senden
export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO Phase 1: Auth-Check
  // TODO Phase 1: Verfügbarkeit prüfen (Überschneidungen ausschließen)
  // TODO Phase 1: Buchung in Supabase anlegen (status: 'requested')
  // TODO Phase 1: Benachrichtigungs-E-Mail an Vermieter

  return NextResponse.json({ message: "Noch nicht implementiert" }, { status: 501 });
}

// GET /api/bookings – Buchungen des eingeloggten Nutzers
export async function GET(request: NextRequest) {
  // TODO Phase 1: Buchungen aus Supabase laden (als Ausleiher + als Vermieter)
  return NextResponse.json({ bookings: [] });
}
