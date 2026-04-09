import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/items/item-form";

export const metadata = { title: "Inserat erstellen – ToolCloud" };

export default async function NewItemPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/items/new");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Inserat erstellen
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Stelle deinen Gegenstand ein und leihe ihn an Nachbarn aus.
        </p>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <ItemForm userId={user.id} />
        </div>
      </div>
    </main>
  );
}
