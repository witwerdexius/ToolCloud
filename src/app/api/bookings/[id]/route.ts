import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyBookingStatus } from "@/lib/supabase/notify";
import type { BookingStatus } from "@/types";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested:  ["confirmed", "rejected", "cancelled"],
  confirmed:  ["completed", "cancelled"],
  completed:  [],
  rejected:   [],
  cancelled:  [],
};

// PATCH /api/bookings/[id] – Status ändern
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { status } = await request.json();

  if (!status) {
    return NextResponse.json({ error: "Status fehlt" }, { status: 400 });
  }

  // Buchung + Item laden
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, borrower_id, item:items(owner_id)")
    .eq("id", params.id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (booking.item as any)?.owner_id;
  const isBorrower = booking.borrower_id === user.id;
  const isOwner = ownerId === user.id;

  if (!isBorrower && !isOwner) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // Transitions-Logik
  const allowed = ALLOWED_TRANSITIONS[booking.status as BookingStatus] ?? [];
  if (!allowed.includes(status as BookingStatus)) {
    return NextResponse.json(
      { error: `Übergang von '${booking.status}' zu '${status}' nicht erlaubt` },
      { status: 400 }
    );
  }

  // Bestimmte Übergänge nur für Vermieter
  if (["confirmed", "rejected"].includes(status) && !isOwner) {
    return NextResponse.json(
      { error: "Nur der Vermieter kann Anfragen annehmen oder ablehnen" },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // E-Mail-Benachrichtigung an Ausleiher bei confirmed / rejected (fire-and-forget)
  if (status === "confirmed" || status === "rejected") {
    notifyBookingStatus(params.id, status);
  }

  return NextResponse.json({ success: true });
}
