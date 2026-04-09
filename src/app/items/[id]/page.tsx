import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/utils";
import { BookingForm } from "@/components/booking/booking-form";
import type { Item, User } from "@/types";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("items")
    .select("title")
    .eq("id", params.id)
    .single();
  return { title: data ? `${data.title} – ToolCloud` : "Inserat – ToolCloud" };
}

export default async function ItemDetailPage({ params }: Props) {
  const supabase = createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*, owner:users(id, name, avatar_url, location, rating, review_count, created_at, verified)")
    .eq("id", params.id)
    .single();

  if (!item) notFound();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isOwner = authUser?.id === item.owner_id;
  const owner = item.owner as User;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Linke Spalte: Bilder + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bildergalerie */}
            <div className="overflow-hidden rounded-2xl bg-gray-100">
              {item.images?.length > 0 ? (
                <div className="grid gap-1" style={{ gridTemplateColumns: item.images.length > 1 ? "2fr 1fr" : "1fr" }}>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {item.images.length > 1 && (
                    <div className="grid gap-1">
                      {item.images.slice(1, 3).map((url: string, i: number) => (
                        <div key={i} className="relative aspect-[4/3]">
                          <Image src={url} alt={item.title} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center text-6xl text-gray-200">
                  {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}
                </div>
              )}
            </div>

            {/* Titel + Meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mb-2 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}{" "}
                    {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                  {item.location && (
                    <p className="mt-1 text-sm text-gray-500">📍 {item.location}</p>
                  )}
                </div>
                {isOwner && (
                  <Link
                    href={`/items/${item.id}/edit`}
                    className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Bearbeiten
                  </Link>
                )}
              </div>

              {item.description && (
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  {item.description}
                </p>
              )}
            </div>

            {/* Vermieter-Info */}
            {owner && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">
                  Angeboten von
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{owner.name}</p>
                    {owner.location && (
                      <p className="text-xs text-gray-400">📍 {owner.location}</p>
                    )}
                    {owner.review_count > 0 && (
                      <p className="text-xs text-gray-500">
                        ★ {owner.rating.toFixed(1)} · {owner.review_count} Bewertung
                        {owner.review_count !== 1 ? "en" : ""}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Dabei seit {formatDate(owner.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rechte Spalte: Buchungs-Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Preis */}
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(item.price_per_day)}
                  {item.price_per_day && (
                    <span className="text-base font-normal text-gray-500"> / Tag</span>
                  )}
                </p>
                {item.deposit && (
                  <p className="text-sm text-gray-500">
                    Kaution: {formatPrice(item.deposit)}
                  </p>
                )}
              </div>

              {isOwner ? (
                <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                  Das ist dein eigenes Inserat.
                </div>
              ) : authUser ? (
                <BookingForm item={item as Item} />
              ) : (
                <div className="text-center">
                  <p className="mb-3 text-sm text-gray-500">
                    Melde dich an, um eine Buchungsanfrage zu senden.
                  </p>
                  <Link
                    href={`/auth/login?next=/items/${item.id}`}
                    className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    Anmelden
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
