// ─── Gemeinsames Layout ───────────────────────────────────────────────────────

const appUrl = Deno.env.get("APP_URL") ?? "https://toolcloud.de";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ToolCloud</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#059669;padding:24px 32px;">
            <a href="${appUrl}" style="font-size:22px;font-weight:700;color:#ffffff;text-decoration:none;">
              🔧 ToolCloud
            </a>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f3f4f6;background:#f9fafb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Du erhältst diese E-Mail, weil du auf
              <a href="${appUrl}" style="color:#059669;">ToolCloud</a> registriert bist.<br>
              © ${new Date().getFullYear()} ToolCloud
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}"
    style="display:inline-block;margin-top:24px;padding:12px 24px;background:#059669;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
    ${text}
  </a>`;
}

function detail(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#6b7280;width:140px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:500;">${value}</td>
  </tr>`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Template: Neue Buchungsanfrage (→ Vermieter) ─────────────────────────────

export interface NewBookingEmailData {
  ownerName: string;
  borrowerName: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
  message?: string | null;
  bookingId: string;
}

export function newBookingEmail(data: NewBookingEmailData): {
  subject: string;
  html: string;
} {
  const bookingUrl = `${appUrl}/bookings`;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">
      Neue Buchungsanfrage 📬
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      Hallo ${data.ownerName},<br><br>
      <strong>${data.borrowerName}</strong> möchte deinen Gegenstand ausleihen:
    </p>

    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">
        ${data.itemTitle}
      </p>
      <table cellpadding="0" cellspacing="0">
        ${detail("Von", formatDate(data.startDate))}
        ${detail("Bis", formatDate(data.endDate))}
        ${detail("Ausleiher", data.borrowerName)}
        ${data.message ? detail("Nachricht", `„${data.message}"`) : ""}
      </table>
    </div>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      Bitte nimm die Anfrage an oder lehne sie ab.
    </p>
    ${btn("Anfrage beantworten →", bookingUrl)}
  `;

  return {
    subject: `Neue Buchungsanfrage: ${data.itemTitle}`,
    html: layout(body),
  };
}

// ─── Template: Buchung bestätigt (→ Mieter) ──────────────────────────────────

export interface BookingConfirmedEmailData {
  borrowerName: string;
  ownerName: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
  bookingId: string;
}

export function bookingConfirmedEmail(data: BookingConfirmedEmailData): {
  subject: string;
  html: string;
} {
  const bookingUrl = `${appUrl}/bookings`;

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">
      Deine Buchung wurde bestätigt ✅
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      Hallo ${data.borrowerName},<br><br>
      Gute Neuigkeiten! <strong>${data.ownerName}</strong> hat deine
      Buchungsanfrage bestätigt.
    </p>

    <div style="background:#ecfdf5;border-left:4px solid #059669;border-radius:0 12px 12px 0;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">
        ${data.itemTitle}
      </p>
      <table cellpadding="0" cellspacing="0">
        ${detail("Von", formatDate(data.startDate))}
        ${detail("Bis", formatDate(data.endDate))}
        ${detail("Vermieter", data.ownerName)}
      </table>
    </div>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      Bitte koordiniere die Übergabe direkt mit dem Vermieter über das Messaging.
    </p>
    ${btn("Zur Buchung →", bookingUrl)}
  `;

  return {
    subject: `Buchung bestätigt: ${data.itemTitle}`,
    html: layout(body),
  };
}

// ─── Template: Buchung storniert (→ jeweils andere Partei) ───────────────────

export interface BookingCancelledEmailData {
  recipientName: string;
  cancelledByName: string;
  cancelledBy: "borrower" | "owner";
  itemTitle: string;
  startDate: string;
  endDate: string;
}

export function bookingCancelledEmail(data: BookingCancelledEmailData): {
  subject: string;
  html: string;
} {
  const bookingUrl = `${appUrl}/bookings`;
  const who = data.cancelledBy === "borrower" ? "der Ausleiher" : "der Vermieter";

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">
      Buchung storniert
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      Hallo ${data.recipientName},<br><br>
      <strong>${data.cancelledByName}</strong> (${who}) hat die Buchungsanfrage
      für <strong>${data.itemTitle}</strong> storniert.
    </p>

    <div style="background:#f9fafb;border-left:4px solid #9ca3af;border-radius:0 12px 12px 0;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">
        ${data.itemTitle}
      </p>
      <table cellpadding="0" cellspacing="0">
        ${detail("Von", formatDate(data.startDate))}
        ${detail("Bis", formatDate(data.endDate))}
        ${detail("Storniert von", data.cancelledByName)}
      </table>
    </div>

    <p style="margin:0;font-size:14px;color:#6b7280;">
      Der Zeitraum ist jetzt wieder frei verfügbar.
    </p>
    ${btn("Zur Buchungsübersicht →", bookingUrl)}
  `;

  return {
    subject: `Buchung storniert: ${data.itemTitle}`,
    html: layout(body),
  };
}

// ─── Template: Buchung abgelehnt (→ Mieter) ──────────────────────────────────

export interface BookingRejectedEmailData {
  borrowerName: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
}

export function bookingRejectedEmail(data: BookingRejectedEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">
      Buchungsanfrage nicht angenommen
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      Hallo ${data.borrowerName},<br><br>
      Leider wurde deine Anfrage für <strong>${data.itemTitle}</strong>
      (${formatDate(data.startDate)} – ${formatDate(data.endDate)}) nicht bestätigt.
    </p>

    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
      Kein Problem – schau dir gerne ähnliche Inserate auf ToolCloud an.
    </p>
    ${btn("Andere Inserate entdecken →", appUrl)}
  `;

  return {
    subject: `Buchungsanfrage für „${data.itemTitle}" nicht bestätigt`,
    html: layout(body),
  };
}
