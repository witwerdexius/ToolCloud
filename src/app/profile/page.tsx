import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Mein Profil – ToolCloud" };

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Profil-Header */}
        <div className="mb-8 flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h1>
              {profile.verified && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Verifiziert
                </span>
              )}
            </div>
            {profile.location && (
              <p className="mt-0.5 text-sm text-gray-500">
                📍 {profile.location}
              </p>
            )}
            {profile.description && (
              <p className="mt-2 text-sm text-gray-700">{profile.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Dabei seit {formatDate(profile.created_at)}
            </p>
          </div>
          <Link
            href="/profile/edit"
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bearbeiten
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.review_count}
            </p>
            <p className="text-xs text-gray-500">Bewertungen</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.rating > 0 ? profile.rating.toFixed(1) : "–"}
            </p>
            <p className="text-xs text-gray-500">Ø Bewertung</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Inserate</p>
          </div>
        </div>

        {/* Tabs – Platzhalter für Phase 1 */}
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex gap-6 border-b border-gray-100 pb-4 mb-6">
            <button className="text-sm font-medium text-emerald-600 border-b-2 border-emerald-600 pb-4 -mb-4">
              Buchungen
            </button>
            <button className="text-sm font-medium text-gray-400">
              Meine Inserate
            </button>
            <button className="text-sm font-medium text-gray-400">
              Bewertungen
            </button>
          </div>
          <p className="text-sm text-gray-400 text-center py-8">
            Buchungen erscheinen hier, sobald du etwas ausgeliehen hast.
          </p>
        </div>
      </div>
    </main>
  );
}
