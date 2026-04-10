"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldErrorStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#EF4444",
};

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <Label htmlFor="password" required>
          Neues Passwort
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mindestens 8 Zeichen"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.password && (
          <p style={fieldErrorStyle}>{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Passwort bestätigen
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Passwort wiederholen"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p style={fieldErrorStyle}>{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <p
          style={{
            borderRadius: 10,
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            padding: "10px 14px",
            fontSize: 13,
            color: "#B91C1C",
          }}
        >
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        style={{ width: "100%", marginTop: 4 }}
      >
        Passwort speichern
      </Button>
    </form>
  );
}
