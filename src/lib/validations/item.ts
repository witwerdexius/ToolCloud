import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";

// Formular-Schema (alle Felder als String, wie Browser sie liefert)
export const itemFormSchema = z.object({
  title: z
    .string()
    .min(3, "Titel muss mindestens 3 Zeichen lang sein")
    .max(80, "Titel darf maximal 80 Zeichen lang sein"),
  description: z
    .string()
    .max(1000, "Beschreibung darf maximal 1000 Zeichen lang sein")
    .optional(),
  category: z.enum(CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: "Bitte eine Kategorie auswählen" }),
  }),
  price_per_day: z.string().optional(),
  deposit: z.string().optional(),
  location: z
    .string()
    .min(2, "Standort erforderlich")
    .max(100, "Standort zu lang"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

// API-Schema (nach der Konvertierung)
export const itemSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  price_per_day: z.number().min(0).max(9999).optional().nullable(),
  deposit: z.number().min(0).max(9999).optional().nullable(),
  location: z.string().min(2).max(100),
  images: z.array(z.string()).optional(),
});

export type ItemInput = z.infer<typeof itemSchema>;

// Konvertiert Formular-Werte → API-Werte
export function formValuesToItemInput(
  values: ItemFormValues,
  images: string[] = []
): ItemInput {
  return {
    title: values.title,
    description: values.description || undefined,
    category: values.category,
    price_per_day:
      values.price_per_day !== "" && values.price_per_day !== undefined
        ? Number(values.price_per_day)
        : null,
    deposit:
      values.deposit !== "" && values.deposit !== undefined
        ? Number(values.deposit)
        : null,
    location: values.location,
    images,
  };
}
