// notify-booking-status
// Wird aufgerufen nach PATCH /api/bookings/[id] (nur bei confirmed / rejected).
// Sendet eine Benachrichtigungs-E-Mail an den Mieter.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";
import {
  bookingCancelledEmail,
  bookingConfirmedEmail,
  bookingRejectedEmail,
} from "../_shared/email-templates.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let bookingId: string;
  let newStatus: string;
  let cancelledBy: "borrower" | "owner" | undefined;
  try {
    const body = await req.json();
    bookingId = body.bookingId;
    newStatus = body.status;
    cancelledBy = body.cancelledBy;
    if (!bookingId || !newStatus) throw new Error("bookingId oder status fehlt");
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Nur relevante Status-Änderungen bearbeiten
  if (!["confirmed", "rejected", "cancelled"].includes(newStatus)) {
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

  // Bei Stornierung: Empfänger ist die jeweils andere Partei
  // Storniert Mieter → Vermieter wird benachrichtigt; storniert Vermieter → Mieter
  const notifyOwner = newStatus === "cancelled" && cancelledBy === "borrower";

  let recipientId: string;
  let recipientEmail: string | undefined;

  if (notifyOwner) {
    if (!owner?.id) {
      return new Response(
        JSON.stringify({ error: "Vermieter nicht gefunden" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
    recipientId = owner.id;
    const { data: ownerAuth } = await supabase.auth.admin.getUserById(owner.id);
    recipientEmail = ownerAuth?.user?.email;
    if (!recipientEmail) {
      console.warn("Keine E-Mail für Vermieter gefunden:", owner.id);
      return new Response(
        JSON.stringify({ error: "E-Mail des Vermieters nicht gefunden" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
  } else {
    recipientId = borrower.id;
    const { data: borrowerAuth } = await supabase.auth.admin.getUserById(borrower.id);
    recipientEmail = borrowerAuth?.user?.email;
    if (!recipientEmail) {
      console.warn("Keine E-Mail für Ausleiher gefunden:", recipientId);
      return new Response(
        JSON.stringify({ error: "E-Mail des Ausleihers nicht gefunden" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
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
  } else if (newStatus === "rejected") {
    ({ subject, html } = bookingRejectedEmail({
      borrowerName: borrower.name,
      itemTitle: item.title,
      startDate: booking.start_date,
      endDate: booking.end_date,
    }));
  } else {
    // cancelled
    const recipientName = notifyOwner ? (owner?.name ?? "Vermieter") : borrower.name;
    const cancelledByName = notifyOwner ? borrower.name : (owner?.name ?? "Vermieter");
    ({ subject, html } = bookingCancelledEmail({
      recipientName,
      cancelledByName,
      cancelledBy: cancelledBy ?? "borrower",
      itemTitle: item.title,
      startDate: booking.start_date,
      endDate: booking.end_date,
    }));
  }

  try {
    await sendEmail({ to: recipientEmail, subject, html });
    console.log(
      `✉ Status-Mail (${newStatus}) an ${recipientEmail} gesendet (Buchung ${bookingId})`
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
