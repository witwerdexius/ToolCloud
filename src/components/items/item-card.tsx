import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Bild */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">
            {CATEGORY_ICONS[item.category]}
          </div>
        )}
        {/* Preis-Badge */}
        <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-sm font-semibold text-gray-900 backdrop-blur-sm shadow-sm">
          {formatPrice(item.price_per_day)}
          {item.price_per_day && (
            <span className="text-xs font-normal text-gray-500"> /Tag</span>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
            {item.title}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {CATEGORY_ICONS[item.category]}{" "}
            {CATEGORY_LABELS[item.category]}
          </span>
          {item.location && (
            <span className="text-xs text-gray-400 truncate max-w-[100px]">
              📍 {item.location}
            </span>
          )}
        </div>

        {item.review_count > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <span className="text-yellow-400">★</span>
            <span>{item.rating.toFixed(1)}</span>
            <span className="text-gray-300">({item.review_count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
