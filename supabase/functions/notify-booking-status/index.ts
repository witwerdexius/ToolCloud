// notify-booking-status
// Wird aufgerufen nach PATCH /api/bookings/[id] (nur bei confirmed / rejected).
// Sendet eine Benachrichtigungs-E-Mail an den Mieter.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";
import {
  bookingConfirmedEmail,
  bookingRejectedEmail,
} from "../_shared/email-templates.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let bookingId: string;
  let newStatus: string;
  try {
    const body = await req.json();
    bookingId = body.bookingId;
    newStatus = body.status;
    if (!bookingId || !newStatus) throw new Error("bookingId oder status fehlt");
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Nur relevante Status-Änderungen bearbeiten
  if (!["confirmed", "rejected"].includes(newStatus)) {
    return new Response(
      JSON.stringify({ skipped: true, reason: "Kein E-Mail-Trigger für diesen Status" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Buchung + Inserat + Vermieter + Ausleiher laden
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      id, start_date, end_date,
      item:items (
        id, title,
        owner:users ( id, name )
      ),
      borrower:users ( id, name )
    `
    )
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    console.error("Buchung nicht gefunden:", error?.message);
    return new Response(JSON.stringify({ error: "Buchung nicht gefunden" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // deno-lint-ignore no-explicit-any
  const item = booking.item as any;
  // deno-lint-ignore no-explicit-any
  const owner = item?.owner as any;
  // deno-lint-ignore no-explicit-any
  const borrower = booking.borrower as any;

  if (!borrower?.id) {
    return new Response(
      JSON.stringify({ error: "Ausleiher nicht gefunden" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // E-Mail-Adresse des Ausleihers aus auth.users holen
  const { data: borrowerAuth } = await supabase.auth.admin.getUserById(
    borrower.id
  );
  const borrowerEmail = borrowerAuth?.user?.email;

  if (!borrowerEmail) {
    console.warn("Keine E-Mail für Ausleiher gefunden:", borrower.id);
    return new Response(
      JSON.stringify({ error: "E-Mail des Ausleihers nicht gefunden" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Richtiges Template wählen und senden
  let subject: string;
  let html: string;

  if (newStatus === "confirmed") {
    ({ subject, html } = bookingConfirmedEmail({
      borrowerName: borrower.name,
      ownerName: owner?.name ?? "Vermieter",
      itemTitle: item.title,
      startDate: booking.start_date,
      endDate: booking.end_date,
      bookingId: booking.id,
    }));
  } else {
    ({ subject, html } = bookingRejectedEmail({
      borrowerName: borrower.name,
      itemTitle: item.title,
      startDate: booking.start_date,
      endDate: booking.end_date,
    }));
  }

  try {
    await sendEmail({ to: borrowerEmail, subject, html });
    console.log(
      `✉ Status-Mail (${newStatus}) an ${borrowerEmail} gesendet (Buchung ${bookingId})`
    );
  } catch (emailErr) {
    console.error("E-Mail-Versand fehlgeschlagen:", emailErr);
    return new Response(
      JSON.stringify({ error: "E-Mail-Versand fehlgeschlagen" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ sent: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
