"use client";

import { useRouter, useSearchParams } from "next/navigation";

const selectStyle: React.CSSProperties = {
  padding: "8px 14px",
  border: "1.5px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13,
  color: "#374151",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
  fontFamily: "inherit",
};

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
    <>
      {/* Umkreis – Platzhalter (Phase 2) */}
      <select disabled style={{ ...selectStyle, color: "#9CA3AF", background: "#F9FAFB", cursor: "not-allowed" }}>
        <option>Umkreis: 10 km</option>
      </select>

      {/* Preis-Filter */}
      <select
        value={maxPrice}
        onChange={(e) => updateParam("max_price", e.target.value)}
        style={selectStyle}
      >
        <option value="">Alle Preise</option>
        <option value="0">Kostenlos</option>
        <option value="5">Bis 5 &euro; / Tag</option>
        <option value="15">Bis 15 &euro; / Tag</option>
      </select>
    </>
  );
}
