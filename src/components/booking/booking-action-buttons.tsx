"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BookingActionButtonsProps {
  bookingId: string;
}

export function BookingActionButtons({ bookingId }: BookingActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "confirmed" | "rejected") {
    setError(null);
    setLoading(status === "confirmed" ? "confirm" : "reject");

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(null);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Fehler");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          loading={loading === "confirm"}
          disabled={loading !== null}
          onClick={() => updateStatus("confirmed")}
        >
          Annehmen
        </Button>
        <Button
          size="sm"
          variant="danger"
          loading={loading === "reject"}
          disabled={loading !== null}
          onClick={() => updateStatus("rejected")}
        >
          Ablehnen
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
