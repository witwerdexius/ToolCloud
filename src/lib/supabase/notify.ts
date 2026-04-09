// Hilfsfunktionen zum Aufrufen der Supabase Edge Functions aus Next.js-API-Routen.
// Fehler werden geloggt, aber nie nach oben propagiert – E-Mails sind nicht-kritisch.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function invokeEdgeFunction(
  name: string,
  body: Record<string, unknown>
): Promise<void> {
  if (!SERVICE_ROLE_KEY) {
    console.warn(
      `[notify] SUPABASE_SERVICE_ROLE_KEY nicht gesetzt – Edge Function "${name}" übersprungen.`
    );
    return;
  }

  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Service-Role-Key dient als Bearer-JWT – von Supabase automatisch verifiziert.
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[notify] ${name} → HTTP ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error(`[notify] ${name} Netzwerkfehler:`, err);
  }
}

/**
 * Benachrichtigt den Vermieter über eine neue Buchungsanfrage.
 * Fire-and-forget – blockiert die API-Antwort nicht.
 */
export function notifyNewBooking(bookingId: string): void {
  void invokeEdgeFunction("notify-new-booking", { bookingId });
}

/**
 * Benachrichtigt den Mieter über eine Statusänderung (confirmed / rejected).
 * Fire-and-forget – blockiert die API-Antwort nicht.
 */
export function notifyBookingStatus(
  bookingId: string,
  status: "confirmed" | "rejected"
): void {
  void invokeEdgeFunction("notify-booking-status", { bookingId, status });
}
