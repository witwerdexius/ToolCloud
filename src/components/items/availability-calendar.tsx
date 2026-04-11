"use client";

import { useState } from "react";
import type { DateRange } from "@/types";

interface AvailabilityCalendarProps {
  blockedRanges: DateRange[];
  // Optional: Markiert ausgewählten Zeitraum (für BookingForm-Integration)
  selectedStart?: string;
  selectedEnd?: string;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isInRange(date: Date, start: string, end: string): boolean {
  const d = toLocalDateString(date);
  return d >= start && d <= end;
}

function isDayBlocked(date: Date, ranges: DateRange[]): "booked" | "blocked" | null {
  for (const r of ranges) {
    if (isInRange(date, r.start, r.end)) return r.type;
  }
  return null;
}

function isDaySelected(date: Date, start?: string, end?: string): boolean {
  if (!start || !end) return false;
  const d = toLocalDateString(date);
  return d >= start && d <= end;
}

export function AvailabilityCalendar({
  blockedRanges,
  selectedStart,
  selectedEnd,
}: AvailabilityCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Tage des aktuellen Monats berechnen
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);

  // Wochentag des 1. (Mo=0 … So=6)
  const startOffset = (firstDay.getDay() + 6) % 7; // JS: So=0 → Mo=0 mapping
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  // Auf volle Wochen auffüllen
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Header mit Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          onClick={prevMonth}
          style={{
            background: "none",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 14,
            color: "#374151",
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 14,
            color: "#374151",
          }}
        >
          ›
        </button>
      </div>

      {/* Wochentags-Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9CA3AF", padding: "2px 0" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Kalender-Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((date, idx) => {
          if (!date) {
            return <div key={idx} />;
          }

          const isPast = date < today;
          const blocked = isDayBlocked(date, blockedRanges);
          const selected = isDaySelected(date, selectedStart, selectedEnd);
          const isToday = toLocalDateString(date) === toLocalDateString(today);

          let bg = "transparent";
          let color = "#111827";
          let title = "";

          if (isPast) {
            color = "#D1D5DB";
          } else if (selected) {
            bg = "#2E7D62";
            color = "#fff";
          } else if (blocked === "booked") {
            bg = "#E5E7EB";
            color = "#9CA3AF";
            title = "Bereits gebucht";
          } else if (blocked === "blocked") {
            bg = "#FEE2E2";
            color = "#EF4444";
            title = "Nicht verfügbar";
          }

          return (
            <div
              key={idx}
              title={title}
              style={{
                textAlign: "center",
                padding: "5px 2px",
                borderRadius: 5,
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                background: bg,
                color,
                border: isToday && !selected ? "1.5px solid #2E7D62" : "1.5px solid transparent",
                cursor: blocked && !isPast ? "not-allowed" : "default",
                userSelect: "none",
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legende */}
      <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "transparent", border: "1px solid #D1D5DB", display: "inline-block" }} />
          Verfügbar
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#E5E7EB", display: "inline-block" }} />
          Gebucht
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#FEE2E2", display: "inline-block" }} />
          Gesperrt
        </div>
        {(selectedStart && selectedEnd) && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6B7280" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "#2E7D62", display: "inline-block" }} />
            Gewählt
          </div>
        )}
      </div>
    </div>
  );
}
