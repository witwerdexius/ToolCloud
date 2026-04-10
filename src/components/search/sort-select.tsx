"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push("?" + params.toString());
  }

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      style={{
        padding: "8px 14px",
        border: "1.5px solid #E5E7EB",
        borderRadius: 8,
        fontSize: 13,
        color: "#374151",
        background: "#fff",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value="newest">⭐ Sortierung: Empfohlen</option>
      <option value="rating">⭐ Beste Bewertung</option>
      <option value="price_asc">💶 Günstiger zuerst</option>
    </select>
  );
}
