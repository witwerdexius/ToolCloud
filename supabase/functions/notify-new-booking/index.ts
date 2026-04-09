// notify-new-booking
// Wird aufgerufen nach POST /api/bookings.
// Sendet eine Benachrichtigungs-E-Mail an den Vermieter.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";
import { newBookingEmail } from "../_shared/email-templates.ts";

Deno.serve(async (req: Request) => {
  // Nur POST erlaubt
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let bookingId: string;
  try {
    const body = await req.json();
    bookingId = body.bookingId;
    if (!bookingId) throw new Error("bookingId fehlt");
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Supabase Admin-Client – hat Zugriff auf alle Daten (inkl. auth.users)
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
      id, start_date, end_date, message,
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

  // Typen auflösen
  // deno-lint-ignore no-explicit-any
  const item = booking.item as any;
  // deno-lint-ignore no-explicit-any
  const owner = item?.owner as any;
  // deno-lint-ignore no-explicit-any
  const borrower = booking.borrower as any;

  if (!owner?.id || !borrower?.name) {
    return new Response(
      JSON.stringify({ error: "Vermieter oder Ausleiher nicht gefunden" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // E-Mail-Adresse des Vermieter aus auth.users holen
  const { data: ownerAuth } = await supabase.auth.admin.getUserById(owner.id);
  const ownerEmail = ownerAuth?.user?.email;

  if (!ownerEmail) {
    console.warn("Keine E-Mail für Vermieter gefunden:", owner.id);
    return new Response(
      JSON.stringify({ error: "E-Mail des Vermieters nicht gefunden" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // E-Mail aufbauen und senden
  const { subject, html } = newBookingEmail({
    ownerName: owner.name,
    borrowerName: borrower.name,
    itemTitle: item.title,
    startDate: booking.start_date,
    endDate: booking.end_date,
    message: booking.message,
    bookingId: booking.id,
  });

  try {
    await sendEmail({ to: ownerEmail, subject, html });
    console.log(`✉ Neue-Anfrage-Mail an ${ownerEmail} gesendet (Buchung ${bookingId})`);
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
