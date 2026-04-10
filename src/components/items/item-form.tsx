"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  itemFormSchema,
  formValuesToItemInput,
  type ItemFormValues,
} from "@/lib/validations/item";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/items/image-upload";
import { AvailabilityManager } from "@/components/items/availability-manager";
import type { Item } from "@/types";

interface ItemFormProps {
  userId: string;
  item?: Item; // edit mode
}

async function uploadImages(
  supabase: ReturnType<typeof createClient>,
  files: File[],
  userId: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("items").upload(path, file);
    if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);
    const {
      data: { publicUrl },
    } = supabase.storage.from("items").getPublicUrl(path);
    urls.push(publicUrl);
  }
  return urls;
}

export function ItemForm({ userId, item }: ItemFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>(
    item?.images ?? []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: item
      ? {
          title: item.title,
          description: item.description ?? "",
          category: item.category,
          price_per_day: item.price_per_day?.toString() ?? "",
          deposit: item.deposit?.toString() ?? "",
          location: item.location,
        }
      : undefined,
  });

  async function onSubmit(data: ItemFormValues) {
    setServerError(null);
    try {
      // 1. Bilder hochladen
      const uploadedUrls = await uploadImages(supabase, newFiles, userId);
      const allImages = [...existingUrls, ...uploadedUrls];
      const payload = formValuesToItemInput(data, allImages);

      // 2. Item speichern
      if (item) {
        // Edit-Modus
        const { error } = await supabase
          .from("items")
          .update({
            title: payload.title,
            description: payload.description ?? null,
            category: payload.category,
            price_per_day: payload.price_per_day ?? null,
            deposit: payload.deposit ?? null,
            location: payload.location,
            images: allImages,
          })
          .eq("id", item.id);
        if (error) throw error;
        router.push(`/items/${item.id}`);
      } else {
        // Neu-Modus
        const { data: created, error } = await supabase
          .from("items")
          .insert({
            owner_id: userId,
            title: payload.title,
            description: payload.description ?? null,
            category: payload.category,
            price_per_day: payload.price_per_day ?? null,
            deposit: payload.deposit ?? null,
            location: payload.location,
            images: allImages,
          })
          .select("id")
          .single();
        if (error) throw error;
        router.push(`/items/${created.id}`);
      }
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Titel */}
      <div>
        <Label htmlFor="title" required>
          Titel
        </Label>
        <Input
          id="title"
          placeholder="z. B. Bohrmaschine Bosch Professional"
          error={errors.title?.message}
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Beschreibung */}
      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Zustand, Zubehör, Hinweise zur Übergabe …"
          error={errors.description?.message}
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Kategorie + Standort */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" required>
            Kategorie
          </Label>
          <Select
            id="category"
            error={errors.category?.message}
            {...register("category")}
          >
            <option value="">Bitte wählen …</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="location" required>
            Standort
          </Label>
          <Input
            id="location"
            placeholder="z. B. Berlin Mitte"
            error={errors.location?.message}
            {...register("location")}
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-500">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      {/* Preis + Kaution */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price_per_day">Preis pro Tag (€)</Label>
          <Input
            id="price_per_day"
            type="number"
            min="0"
            step="0.01"
            placeholder="0 = kostenlos"
            error={errors.price_per_day?.message}
            {...register("price_per_day")}
          />
          {errors.price_per_day && (
            <p className="mt-1 text-xs text-red-500">
              {errors.price_per_day.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="deposit">Kaution (€)</Label>
          <Input
            id="deposit"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            error={errors.deposit?.message}
            {...register("deposit")}
          />
          {errors.deposit && (
            <p className="mt-1 text-xs text-red-500">
              {errors.deposit.message}
            </p>
          )}
        </div>
      </div>

      {/* Bilder */}
      <div>
        <Label>Bilder</Label>
        <ImageUpload
          files={newFiles}
          existingUrls={existingUrls}
          onChange={setNewFiles}
          onRemoveExisting={(url) =>
            setExistingUrls((prev) => prev.filter((u) => u !== url))
          }
        />
      </div>

      {/* Verfügbarkeit – nur im Bearbeitungsmodus, da Item-ID bekannt sein muss */}
      {item && (
        <div>
          <Label>Verfügbarkeit / Sperrzeiten</Label>
          <p className="mb-2 text-xs text-gray-500">
            Zeiträume, in denen das Inserat nicht verfügbar ist (z. B. Urlaub, Reparatur).
          </p>
          <AvailabilityManager itemId={item.id} />
        </div>
      )}

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {item ? "Änderungen speichern" : "Inserat veröffentlichen"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
