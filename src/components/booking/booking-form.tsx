"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, calcTotalPrice } from "@/lib/utils";
import type { Item } from "@/types";

interface BookingFormProps {
  item: Item;
}

export function BookingForm({ item }: BookingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const priceCalc =
    startDate && endDate && endDate > startDate
      ? calcTotalPrice(item.price_per_day, startDate, endDate, item.deposit)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Bitte Start- und Enddatum auswählen.");
      return;
    }
    if (endDate <= startDate) {
      setError("Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          start_date: startDate,
          end_date: endDate,
          message: message || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Fehler beim Senden der Anfrage.");
        return;
      }

      router.push("/bookings");
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start_date" required>
            Von
          </Label>
          <Input
            id="start_date"
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end_date" required>
            Bis
          </Label>
          <Input
            id="end_date"
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Preisberechnung */}
      {priceCalc && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1">
          {item.price_per_day ? (
            <>
              <div className="flex justify-between text-gray-600">
                <span>
                  {formatPrice(item.price_per_day)} × {priceCalc.days} Tag
                  {priceCalc.days !== 1 ? "e" : ""}
                </span>
                <span>{formatPrice(priceCalc.rentalCost)}</span>
              </div>
              {priceCalc.deposit > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Kaution</span>
                  <span>{formatPrice(priceCalc.deposit)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Servicegebühr</span>
                <span>{formatPrice(priceCalc.serviceFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                <span>Gesamt</span>
                <span>{formatPrice(priceCalc.total)}</span>
              </div>
            </>
          ) : (
            <p className="text-emerald-700 font-medium">Kostenlos · {priceCalc.days} Tag{priceCalc.days !== 1 ? "e" : ""}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="message">Nachricht an den Vermieter</Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Kurze Vorstellung, Verwendungszweck …"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        Anfrage senden
      </Button>
    </form>
  );
}
