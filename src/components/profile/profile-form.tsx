"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types";

interface ProfileFormProps {
  user: User;
}

function isVacationActive(start?: string | null, end?: string | null): boolean {
  if (!start || !end) return false;
  const today = new Date().toISOString().split("T")[0];
  return today >= start && today <= end;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      location: user.location ?? "",
      description: user.description ?? "",
      vacation_start: user.vacation_start ?? "",
      vacation_end: user.vacation_end ?? "",
    },
  });

  const vacationStart = watch("vacation_start");
  const vacationEnd = watch("vacation_end");

  const vacationActiveNow = isVacationActive(
    user.vacation_start,
    user.vacation_end
  );

  async function onSubmit(data: ProfileInput) {
    setServerError(null);
    setSuccess(false);

    const { error } = await supabase
      .from("users")
      .update({
        name: data.name,
        location: data.location || null,
        description: data.description || null,
        vacation_start: data.vacation_start || null,
        vacation_end: data.vacation_end || null,
      })
      .eq("id", user.id);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  function clearVacation() {
    setValue("vacation_start", "", { shouldDirty: true });
    setValue("vacation_end", "", { shouldDirty: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Dein Name"
          error={errors.name?.message}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Standort</Label>
        <Input
          id="location"
          type="text"
          placeholder="z. B. Berlin, Hamburg …"
          error={errors.location?.message}
          {...register("location")}
        />
        {errors.location && (
          <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Über mich</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Erzähl anderen kurz etwas über dich …"
          error={errors.description?.message}
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">Maximal 500 Zeichen</p>
      </div>

      {/* ── Urlaubsmodus ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏖️</span>
            <span className="text-sm font-semibold text-amber-900">
              Urlaubsmodus
            </span>
          </div>
          {vacationActiveNow && (
            <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-white">
              Aktiv
            </span>
          )}
        </div>

        <p className="mb-3 text-xs text-amber-700">
          Während des Urlaubsmodus sind alle deine Inserate automatisch für
          Buchungen gesperrt.
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <label
              htmlFor="vacation_start"
              className="mb-1 block text-xs font-medium text-amber-800"
            >
              Von
            </label>
            <input
              id="vacation_start"
              type="date"
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              {...register("vacation_start")}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="vacation_end"
              className="mb-1 block text-xs font-medium text-amber-800"
            >
              Bis
            </label>
            <input
              id="vacation_end"
              type="date"
              min={vacationStart ?? undefined}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              {...register("vacation_end")}
            />
          </div>
        </div>

        {(errors as { vacation_end?: { message?: string } }).vacation_end && (
          <p className="mt-1 text-xs text-red-500">
            {(errors as { vacation_end?: { message?: string } }).vacation_end?.message}
          </p>
        )}

        {(vacationStart || vacationEnd) && (
          <button
            type="button"
            onClick={clearVacation}
            className="mt-2 text-xs text-amber-600 underline hover:text-amber-800"
          >
            Urlaubsmodus entfernen
          </button>
        )}
      </div>
      {/* ─────────────────────────────────────────────────────────── */}

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profil erfolgreich gespeichert.
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
        >
          Speichern
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
