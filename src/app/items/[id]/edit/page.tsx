import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/items/item-form";
import { ToggleActiveButton } from "@/components/items/toggle-active-button";
import type { Item } from "@/types";

interface Props {
  params: { id: string };
}

export const metadata = { title: "Inserat bearbeiten – ToolCloud" };

export default async function EditItemPage({ params }: Props) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=/items/${params.id}/edit`);

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!item) notFound();
  if (item.owner_id !== user.id) redirect(`/items/${params.id}`);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/items/${params.id}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Inserat
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-semibold text-gray-900">
            Inserat bearbeiten
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <ItemForm userId={user.id} item={item as Item} />
        </div>

        {/* Inserat deaktivieren */}
        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Inserat deaktivieren
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Das Inserat wird nicht mehr in der Suche angezeigt. Du kannst es
            jederzeit wieder aktivieren.
          </p>
          <ToggleActiveButton
            itemId={params.id}
            isActive={item.is_active}
          />
        </div>
      </div>
    </main>
  );
}
