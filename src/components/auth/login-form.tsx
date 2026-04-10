"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldErrorStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#EF4444",
};

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "E-Mail oder Passwort falsch."
          : error.message
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Label htmlFor="password" required style={{ marginBottom: 0 }}>
            Passwort
          </Label>
          <Link
            href="/auth/forgot-password"
            className="tc-link"
            style={{ fontSize: 12 }}
          >
            Passwort vergessen?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.password && (
          <p style={fieldErrorStyle}>{errors.password.message}</p>
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
        Anmelden
      </Button>

      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#6B7280",
          marginTop: 4,
        }}
      >
        Noch kein Konto?{" "}
        <Link href="/auth/register" className="tc-link">
          Jetzt registrieren
        </Link>
      </p>
    </form>
  );
}
