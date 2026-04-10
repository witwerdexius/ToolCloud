"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, calcTotalPrice } from "@/lib/utils";
import type { Item } from "@/types";

interface BookingFormProps {
  item: Item;
}

export function BookingForm({ item }: BookingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const priceCalc =
    startDate && endDate && endDate > startDate
      ? calcTotalPrice(item.price_per_day, startDate, endDate, item.deposit)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Bitte Start- und Enddatum auswählen.");
      return;
    }
    if (endDate <= startDate) {
      setError("Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          start_date: startDate,
          end_date: endDate,
          message: message || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Fehler beim Senden der Anfrage.");
        return;
      }

      router.push("/bookings");
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    color: "#111827",
    transition: "border-color .15s",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Date row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Von</label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2E7D62")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>
        <div>
          <label style={labelStyle}>Bis</label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2E7D62")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>
      </div>

      {/* Message */}
      <label style={labelStyle}>Nachricht an den Vermieter (optional)</label>
      <textarea
        rows={3}
        placeholder="Wofür brauchst du das Werkzeug?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ ...inputStyle, resize: "none", marginBottom: 0 }}
        onFocus={(e) => (e.target.style.borderColor = "#2E7D62")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
      />

      {/* Price summary */}
      {priceCalc && (
        <div
          style={{
            background: "#F9FAFB",
            borderRadius: 8,
            padding: 14,
            margin: "16px 0",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {item.price_per_day ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{formatPrice(item.price_per_day)} × {priceCalc.days} Tag{priceCalc.days !== 1 ? "e" : ""}</span>
                <span>{formatPrice(priceCalc.rentalCost)}</span>
              </div>
              {priceCalc.deposit > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Kaution (wird zurückerstattet)</span>
                  <span>{formatPrice(priceCalc.deposit)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Servicegebühr</span>
                <span>{formatPrice(priceCalc.serviceFee)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  borderTop: "1px solid #E5E7EB",
                  paddingTop: 8,
                  marginTop: 4,
                  color: "#111827",
                }}
              >
                <span>Gesamt</span>
                <span>{formatPrice(priceCalc.total)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: "#2E7D62", fontWeight: 600 }}>
              Kostenlos · {priceCalc.days} Tag{priceCalc.days !== 1 ? "e" : ""}
            </p>
          )}
        </div>
      )}

      {error && (
        <p style={{ background: "#FEE2E2", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#EF4444", margin: "8px 0" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 20px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          background: loading ? "#9CA3AF" : "#2E7D62",
          color: "#fff",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background .15s",
          marginTop: 16,
        }}
      >
        {loading ? "Wird gesendet …" : "Buchung anfragen"}
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
        Du wirst noch nicht belastet.
      </p>
    </form>
  );
}
