import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Registrieren – ToolCloud" };

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Konto erstellen</h1>
      <p className="mb-6 text-sm text-gray-500">
        Kostenlos registrieren und sofort loslegen.
      </p>
      <RegisterForm />
    </div>
  );
}
