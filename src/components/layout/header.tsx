import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";

  let profile: { name: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function navLinkStyle(active: boolean): React.CSSProperties {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "8px 14px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      textDecoration: "none",
      transition: "background .15s, color .15s",
      color: active ? "#2E7D62" : "#374151",
      background: active ? "#E8F5F0" : "transparent",
      whiteSpace: "nowrap",
    };
  }

  return (
    <header
      style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", height: 60 }}
      className="sticky top-0 z-50 flex items-center justify-between px-6"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline" style={{ color: "#2E7D62", fontWeight: 800, fontSize: 20 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#2E7D62" />
          <path d="M7 14l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        ToolCloud
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              href="/"
              style={navLinkStyle(pathname === "/")}
            >
              Entdecken
            </Link>
            <Link
              href="/bookings"
              style={navLinkStyle(pathname.startsWith("/bookings"))}
            >
              Meine Buchungen
            </Link>
            <Link
              href="/items/new"
              style={navLinkStyle(pathname.startsWith("/items/new"))}
            >
              + Inserat
            </Link>
            <Link
              href="/messages"
              style={navLinkStyle(pathname.startsWith("/messages"))}
            >
              Nachrichten
            </Link>
            {/* Avatar */}
            <Link
              href="/profile"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#2E7D62", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                textDecoration: "none",
              }}
              title="Profil"
            >
              {initials}
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/"
              style={navLinkStyle(pathname === "/")}
            >
              Entdecken
            </Link>
            <Link
              href="/auth/login"
              style={navLinkStyle(pathname.startsWith("/auth/login"))}
            >
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: "#2E7D62", color: "#fff", textDecoration: "none",
                transition: "background .15s", whiteSpace: "nowrap",
              }}
            >
              Registrieren
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
