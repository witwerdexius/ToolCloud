import { describe, it, expect } from "vitest";
import { cn, formatPrice, calcTotalPrice, getStars } from "./utils";

describe("cn", () => {
  it("kombiniert Klassen", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignoriert falsy-Werte", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("löst Tailwind-Konflikte auf", () => {
    // tailwind-merge: spätere Klasse gewinnt
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("formatPrice", () => {
  it("formatiert einen Preis mit Komma und €", () => {
    expect(formatPrice(12.5)).toBe("12,50 €");
  });

  it("gibt 'Kostenlos' zurück wenn kein Preis", () => {
    expect(formatPrice(undefined)).toBe("Kostenlos");
    expect(formatPrice(0)).toBe("Kostenlos");
  });

  it("rundet auf zwei Dezimalstellen", () => {
    expect(formatPrice(9.9)).toBe("9,90 €");
    expect(formatPrice(100)).toBe("100,00 €");
  });
});

describe("calcTotalPrice", () => {
  it("berechnet Gesamtpreis korrekt", () => {
    const result = calcTotalPrice(10, "2025-06-01", "2025-06-04", 50, 1);
    expect(result.days).toBe(3);
    expect(result.rentalCost).toBe(30);
    expect(result.deposit).toBe(50);
    expect(result.serviceFee).toBe(1);
    expect(result.total).toBe(81);
  });

  it("behandelt kostenlosen Verleih (kein Preis pro Tag)", () => {
    const result = calcTotalPrice(undefined, "2025-06-01", "2025-06-03", 0, 1);
    expect(result.rentalCost).toBe(0);
    expect(result.total).toBe(1); // nur Servicegebühr
  });
});

describe("getStars", () => {
  it("gibt 5 Sterne-Objekte zurück", () => {
    expect(getStars(3)).toHaveLength(5);
  });

  it("markiert ganze Sterne korrekt", () => {
    const stars = getStars(3);
    expect(stars[0]).toBe("full");
    expect(stars[1]).toBe("full");
    expect(stars[2]).toBe("full");
    expect(stars[3]).toBe("empty");
    expect(stars[4]).toBe("empty");
  });

  it("erkennt halbe Sterne", () => {
    const stars = getStars(3.5);
    expect(stars[3]).toBe("half");
  });

  it("gibt 5 volle Sterne bei Bewertung 5", () => {
    expect(getStars(5).every((s) => s === "full")).toBe(true);
  });

  it("gibt 5 leere Sterne bei Bewertung 0", () => {
    expect(getStars(0).every((s) => s === "empty")).toBe(true);
  });
});
