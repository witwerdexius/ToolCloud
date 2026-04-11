"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CancelBookingButtonProps {
  bookingId: string;
}

function CancelModal({
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "28px 32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          minWidth: 300,
          maxWidth: 400,
          width: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
          Buchung stornieren?
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: "#EF4444" }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={onCancel}
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={loading}
            disabled={loading}
            onClick={onConfirm}
          >
            Ja, stornieren
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Fehler beim Stornieren");
      return;
    }

    setConfirming(false);
    router.refresh();
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(true)}
        style={{ color: "#6B7280", fontSize: 12 }}
      >
        Anfrage stornieren
      </Button>
      {confirming && (
        <CancelModal
          loading={loading}
          error={error}
          onConfirm={handleCancel}
          onCancel={() => {
            setConfirming(false);
            setError(null);
          }}
        />
      )}
    </>
  );
}
