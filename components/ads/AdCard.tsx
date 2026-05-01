import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Ad, AdImage, Category } from "@prisma/client";

type AdWithRelations = Ad & {
  images: AdImage[];
  category: Category;
  author: { id: string; name: string | null };
};

interface AdCardProps {
  ad: AdWithRelations;
}

function formatPrice(price: number | string | { toString(): string }) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function AdCard({ ad }: AdCardProps) {
  const coverImage = ad.images[0]?.url;

  return (
    <Link href={`/ads/${ad.id}`} className="group block">
      {/* Image Container */}
      <div className="ad-image-ratio bg-muted overflow-hidden img-hover-zoom relative">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Tidak ada foto</span>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-background text-foreground text-[10px] uppercase tracking-widest px-2 py-1 font-medium">
            {ad.condition === "NEW" ? "Baru" : "Bekas"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 space-y-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
          {ad.category.name}
        </p>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
          {ad.title}
        </h3>
        <p className="text-sm font-medium">{formatPrice(ad.price)}</p>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
          <MapPin size={10} strokeWidth={1.5} />
          <span>{ad.location}</span>
        </div>
      </div>
    </Link>
  );
}
