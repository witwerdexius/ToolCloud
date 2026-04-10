"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  const maxPrice = searchParams.get("max_price") ?? "";

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {/* Umkreis – Platzhalter, bis Geo-Daten verfügbar (Phase 2) */}
      {/* Preis-Filter */}
      <select
        value={maxPrice}
        onChange={(e) => updateParam("max_price", e.target.value)}
        style={{
          padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8,
          fontSize: 13, color: "#374151", background: "#fff",
          cursor: "pointer", outline: "none",
        }}
      >
        <option value="">Alle Preise</option>
        <option value="0">Kostenlos</option>
        <option value="5">Bis 5 € / Tag</option>
        <option value="15">Bis 15 € / Tag</option>
      </select>
    </div>
  );
}
