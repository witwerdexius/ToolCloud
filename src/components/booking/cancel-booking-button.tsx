"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CancelBookingButtonProps {
  bookingId: string;
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
      setConfirming(false);
      return;
    }

    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
          Wirklich stornieren?
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <Button
            size="sm"
            variant="danger"
            loading={loading}
            disabled={loading}
            onClick={handleCancel}
          >
            Ja, stornieren
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => setConfirming(false)}
          >
            Abbrechen
          </Button>
        </div>
        {error && <p style={{ margin: 0, fontSize: 11, color: "#EF4444" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(true)}
        style={{ color: "#6B7280", fontSize: 12 }}
      >
        Anfrage stornieren
      </Button>
      {error && <p style={{ margin: 0, fontSize: 11, color: "#EF4444" }}>{error}</p>}
    </div>
  );
}
