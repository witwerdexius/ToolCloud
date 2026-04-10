import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { BookingActionButtons } from "@/components/booking/booking-action-buttons";

export const metadata = { title: "Buchungen – ToolCloud" };

export default async function BookingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/bookings");

  // Meine Anfragen (als Ausleiher)
  const { data: myRequests } = await supabase
    .from("bookings")
    .select("*, item:items(id, title, images, category, location, owner_id)")
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  // Eingehende Anfragen (als Vermieter)
  const { data: incomingRequests } = await supabase
    .from("bookings")
    .select(
      "*, item:items(id, title, images, category, location, owner_id), borrower:users(id, name)"
    )
    .eq("items.owner_id", user.id)
    .order("created_at", { ascending: false });

  // Alternativer Query für eingehende Anfragen via items
  const { data: myItems } = await supabase
    .from("items")
    .select("id")
    .eq("owner_id", user.id);

  const myItemIds = myItems?.map((i) => i.id) ?? [];

  const { data: incoming } = myItemIds.length
    ? await supabase
        .from("bookings")
        .select(
          "*, item:items(id, title, images, category, location), borrower:users(id, name)"
        )
        .in("item_id", myItemIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Buchungen</h1>
        </div>

        {/* Meine Anfragen */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Meine Anfragen
          </h2>
          {!myRequests || myRequests.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-500">Du hast noch keine Buchungsanfragen gesendet.</p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm text-emerald-600 hover:underline"
              >
                Inserate entdecken
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  viewAs="borrower"
                  currentUserId={user.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Eingehende Anfragen */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Eingehende Anfragen
          </h2>
          {!incoming || incoming.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <p className="text-gray-500">Noch keine Anfragen für deine Inserate.</p>
              <Link
                href="/items/new"
                className="mt-3 inline-block text-sm text-emerald-600 hover:underline"
              >
                Inserat erstellen
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {incoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  viewAs="owner"
                  currentUserId={user.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type BookingCardItem = {
  id: string;
  title: string;
  images: string[];
  category: string;
  location: string;
} | null;

type BookingCardData = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  message: string | null;
  item: BookingCardItem;
  borrower: { id: string; name: string } | null;
};

function BookingCard({
  booking,
  viewAs,
}: {
  booking: BookingCardData;
  viewAs: "borrower" | "owner";
  currentUserId: string;
}) {
  const item = booking.item;
  const statusColor =
    BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] ??
    "bg-gray-100 text-gray-500";
  const statusLabel =
    BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS] ??
    booking.status;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-start gap-4 p-4">
        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {item?.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 text-xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/items/${item?.id}`}
              className="font-medium text-gray-900 hover:text-emerald-700 truncate"
            >
              {item?.title ?? "Inserat"}
            </Link>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
          </p>
          {viewAs === "owner" && booking.borrower && (
            <p className="text-xs text-gray-400">
              Von: {booking.borrower.name}
            </p>
          )}
          {booking.message && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
              &bdquo;{booking.message}&ldquo;
            </p>
          )}
        </div>
      </div>

      {/* Aktionen für Vermieter bei pending-Anfragen */}
      {viewAs === "owner" && booking.status === "requested" && (
        <div className="border-t border-gray-100 px-4 py-3">
          <BookingActionButtons bookingId={booking.id} />
        </div>
      )}
    </div>
  );
}
