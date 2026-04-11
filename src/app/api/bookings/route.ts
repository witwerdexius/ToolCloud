import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { notifyNewBooking } from "@/lib/supabase/notify";
import { differenceInDays, parseISO } from "date-fns";

// GET /api/bookings – Eigene Buchungen
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, item:items(id, title, images, category, location)")
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

// POST /api/bookings – Buchungsanfrage erstellen
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ungültige Anfrage" },
      { status: 400 }
    );
  }

  const { item_id, start_date, end_date, message } = parsed.data;

  // Item abrufen für Preis-Berechnung + Eigentümer-Check
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, owner_id, price_per_day, deposit, is_active")
    .eq("id", item_id)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  }

  if (!item.is_active) {
    return NextResponse.json({ error: "Inserat ist nicht aktiv" }, { status: 400 });
  }

  if (item.owner_id === user.id) {
    return NextResponse.json(
      { error: "Du kannst dein eigenes Inserat nicht buchen" },
      { status: 400 }
    );
  }

  // Urlaubsmodus-Prüfung: Buchungszeitraum darf nicht mit Urlaub des Verleihers überlappen
  const { data: owner } = await supabase
    .from("users")
    .select("vacation_start, vacation_end")
    .eq("id", item.owner_id)
    .single();

  if (owner?.vacation_start && owner?.vacation_end) {
    const vacOverlap =
      start_date <= owner.vacation_end && end_date >= owner.vacation_start;
    if (vacOverlap) {
      return NextResponse.json(
        { error: "Der Vermieter ist in diesem Zeitraum im Urlaub und nimmt keine Buchungen an." },
        { status: 400 }
      );
    }
  }

  // Serverseitige Prüfung: Überschneidung mit Sperrzeiten
  const { data: blockedPeriods } = await supabase
    .from("item_availability")
    .select("start_date, end_date")
    .eq("item_id", item_id)
    .lte("start_date", end_date)
    .gte("end_date", start_date);

  if (blockedPeriods && blockedPeriods.length > 0) {
    return NextResponse.json(
      { error: "Das Inserat ist in diesem Zeitraum nicht verfügbar." },
      { status: 400 }
    );
  }

  const days = Math.max(1, differenceInDays(parseISO(end_date), parseISO(start_date)));
  const rentalCost = (item.price_per_day ?? 0) * days;
  const serviceFee = rentalCost > 0 ? 1 : 0;
  const totalPrice = rentalCost + (item.deposit ?? 0) + serviceFee;

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      item_id,
      borrower_id: user.id,
      start_date,
      end_date,
      message: message ?? null,
      total_price: totalPrice,
      status: "requested",
    })
    .select("id")
    .single();

  if (insertError) {
    const msg = insertError.message.includes("no_double_booking")
      ? "Diese Daten sind bereits gebucht."
      : insertError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // E-Mail-Benachrichtigung an Vermieter (fire-and-forget)
  notifyNewBooking(booking.id);

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
