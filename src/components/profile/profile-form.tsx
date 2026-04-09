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

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      location: user.location ?? "",
      description: user.description ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setServerError(null);
    setSuccess(false);

    const { error } = await supabase
      .from("users")
      .update({
        name: data.name,
        location: data.location || null,
        description: data.description || null,
      })
      .eq("id", user.id);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
    router.refresh();
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
