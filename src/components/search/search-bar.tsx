"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 640,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      <input
        ref={inputRef}
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Was suchst du? z. B. Bohrmaschine, Zelt …"
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "16px 20px",
          fontSize: 15,
          color: "#111827",
          background: "transparent",
        }}
      />
      {/* Divider */}
      <div style={{ width: 1, height: 32, background: "#E5E7EB", flexShrink: 0 }} />
      {/* Location */}
      <button
        type="button"
        style={{
          border: "none",
          outline: "none",
          padding: "16px",
          fontSize: 14,
          color: "#6B7280",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Berlin
      </button>
      {/* Search button */}
      <button
        type="submit"
        style={{
          background: "#2E7D62",
          border: "none",
          cursor: "pointer",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          transition: "background .15s",
          flexShrink: 0,
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1e6b50")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#2E7D62")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Suchen
      </button>
    </form>
  );
}
