import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Anmelden – ToolCloud" };

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Willkommen zurück</h1>
      <p className="mb-6 text-sm text-gray-500">
        Melde dich an, um Gegenstände zu leihen oder zu verleihen.
      </p>
      <LoginForm />
    </div>
  );
}
