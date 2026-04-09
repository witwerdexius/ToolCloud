// Resend API-Wrapper für Supabase Edge Functions (Deno)
// Nutzt die fetch-API direkt – kein npm-Paket nötig.

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");

  const from =
    Deno.env.get("FROM_EMAIL") ?? "ToolCloud <noreply@toolcloud.de>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend-Fehler ${res.status}: ${body}`);
  }
}
