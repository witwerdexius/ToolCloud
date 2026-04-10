"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldErrorStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#EF4444",
};

export function RegisterForm() {
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div
        style={{
          borderRadius: 12,
          background: "#E8F5F0",
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Fast geschafft!
        </h2>
        <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>
          Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf
          den Link darin, um dein Konto zu aktivieren.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <Label htmlFor="name" required>
          Dein Name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Max Mustermann"
          error={errors.name?.message}
          {...register("name")}
        />
        {errors.name && <p style={fieldErrorStyle}>{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" required>
          E-Mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="du@beispiel.de"
          error={errors.email?.message}
          {...register("email")}
        />
        {errors.email && <p style={fieldErrorStyle}>{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password" required>
          Passwort
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
        Konto erstellen
      </Button>

      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#6B7280",
          marginTop: 4,
        }}
      >
        Bereits registriert?{" "}
        <Link href="/auth/login" className="tc-link">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
