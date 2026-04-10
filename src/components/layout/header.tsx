import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              style={{ fontSize: 14 }}
            >
              Entdecken
            </Link>
            <Link
              href="/bookings"
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Meine Buchungen
            </Link>
            <Link
              href="/items/new"
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              + Inserat
            </Link>
            <Link
              href="/messages"
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Entdecken
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg px-[14px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg px-[14px] py-2 text-sm font-semibold text-white transition-colors"
              style={{ background: "#2E7D62" }}
            >
              Registrieren
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
