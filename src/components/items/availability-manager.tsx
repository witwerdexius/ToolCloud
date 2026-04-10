"use client";

import { useState, useEffect } from "react";
import type { ItemAvailability } from "@/types";

interface AvailabilityManagerProps {
  itemId: string;
}

function formatDateDE(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

export function AvailabilityManager({ itemId }: AvailabilityManagerProps) {
  const [blocked, setBlocked] = useState<ItemAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formular für neuen Zeitraum
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/items/${itemId}/availability`)
      .then((r) => r.json())
      .then((json) => setBlocked(json.blocked ?? []))
      .catch(() => setError("Verfügbarkeiten konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, [itemId]);

  async function handleAdd() {
    setError(null);
    if (!startDate || !endDate) {
      setError("Bitte Start- und Enddatum angeben.");
      return;
    }
    if (endDate < startDate) {
      setError("Enddatum muss nach Startdatum liegen.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/items/${itemId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_date: startDate, end_date: endDate, note: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Fehler beim Speichern.");
        return;
      }
      setBlocked((prev) => [...prev, json.availability]);
      setStartDate("");
      setEndDate("");
      setNote("");
      setShowForm(false);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/items/${itemId}/availability?availability_id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    } else {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Löschen.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 7,
    fontSize: 13,
    outline: "none",
    color: "#111827",
    background: "#fff",
  };

  if (loading) {
    return (
      <div style={{ padding: "12px 0", fontSize: 13, color: "#9CA3AF" }}>
        Lade Sperrzeiten …
      </div>
    );
  }

  return (
    <div>
      {/* Liste vorhandener Sperrzeiten */}
      {blocked.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {blocked.map((b) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FEF2F2",
                borderRadius: 7,
                padding: "8px 12px",
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "#EF4444" }}>
                  {formatDateDE(b.start_date)} – {formatDateDE(b.end_date)}
                </span>
                {b.note && (
                  <span style={{ color: "#6B7280", marginLeft: 8 }}>({b.note})</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#EF4444",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "0 4px",
                }}
                title="Sperrzeit löschen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 12 }}>
          Keine Sperrzeiten gesetzt – das Inserat gilt täglich als verfügbar.
        </p>
      )}

      {/* Formular ein-/ausblenden */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 600,
            background: "#F3F4F6",
            color: "#374151",
            border: "none",
            cursor: "pointer",
          }}
        >
          + Sperrzeit hinzufügen
        </button>
      ) : (
        <div
          style={{
            background: "#F9FAFB",
            borderRadius: 8,
            padding: 14,
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>
                Von
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>
                Bis
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>
              Grund (optional)
            </label>
            <input
              type="text"
              placeholder="z. B. Urlaub, Reparatur …"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#EF4444", background: "#FEE2E2", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              style={{
                padding: "7px 16px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: saving ? "#9CA3AF" : "#2E7D62",
                color: "#fff",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Speichern …" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); setStartDate(""); setEndDate(""); setNote(""); }}
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: "#F3F4F6",
                color: "#374151",
                border: "none",
                cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
