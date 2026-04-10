"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

interface MobileNavProps {
  user: boolean;
  initials: string;
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "13px 16px",
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 500,
        color: "#374151",
        textDecoration: "none",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      {children}
    </Link>
  );
}

export function MobileNav({ user, initials }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ display: "block", width: 22, height: 2, background: "#374151", borderRadius: 2 }} />
        <span style={{ display: "block", width: 22, height: 2, background: "#374151", borderRadius: 2 }} />
        <span style={{ display: "block", width: 22, height: 2, background: "#374151", borderRadius: 2 }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 270,
          background: "#fff",
          zIndex: 100,
          padding: "0",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 18, color: "#2E7D62" }}>Menü</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Menü schließen"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: "#6B7280",
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Links */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {user ? (
            <>
              <MobileLink href="/" onClick={() => setOpen(false)}>🔍 Entdecken</MobileLink>
              <MobileLink href="/bookings" onClick={() => setOpen(false)}>📅 Meine Buchungen</MobileLink>
              <MobileLink href="/items/new" onClick={() => setOpen(false)}>➕ Inserat erstellen</MobileLink>
              <MobileLink href="/messages" onClick={() => setOpen(false)}>💬 Nachrichten</MobileLink>
              <MobileLink href="/profile" onClick={() => setOpen(false)}>👤 Profil ({initials})</MobileLink>
              <div style={{ padding: "8px 16px", marginTop: 4 }}>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <MobileLink href="/" onClick={() => setOpen(false)}>🔍 Entdecken</MobileLink>
              <MobileLink href="/auth/login" onClick={() => setOpen(false)}>🔐 Anmelden</MobileLink>
              <MobileLink href="/auth/register" onClick={() => setOpen(false)}>📝 Registrieren</MobileLink>
            </>
          )}
        </div>
      </div>
    </>
  );
}
