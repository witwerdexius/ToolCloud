import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Passwort vergessen – ToolCloud" };

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Passwort zurücksetzen</h1>
      <p className="mb-6 text-sm text-gray-500">
        Gib deine E-Mail-Adresse ein – wir schicken dir einen Reset-Link.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
