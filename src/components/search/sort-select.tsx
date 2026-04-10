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
      className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 focus:outline-none"
    >
      <option value="newest">Neueste</option>
      <option value="price_asc">Günstigste</option>
      <option value="rating">Beste Bewertung</option>
    </select>
  );
}
