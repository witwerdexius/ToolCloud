import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Neues Passwort – ToolCloud" };

export default function ResetPasswordPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Neues Passwort</h1>
      <p className="mb-6 text-sm text-gray-500">
        Wähle ein neues, sicheres Passwort für dein Konto.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
