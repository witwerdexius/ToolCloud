import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Neues Passwort – ToolCloud" };

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid #F3F4F6",
        padding: "36px 32px",
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#111827",
          marginBottom: 6,
          lineHeight: 1.2,
        }}
      >
        Neues Passwort
      </h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
        Wähle ein neues, sicheres Passwort für dein Konto.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
