"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdCard from "@/components/ads/AdCard";
import { HeartCrack } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ad, AdImage, Category } from "@prisma/client";

type AdWithRelations = Ad & {
  images: AdImage[];
  category: Category;
  author: { id: string; name: string | null };
};

type WishlistItem = {
  id: string;
  adId: string;
  ad: AdWithRelations;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Wishlist Saya</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="ad-image-ratio w-full" />
              <div className="pt-3 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Wishlist Saya</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border bg-muted/30">
          <HeartCrack size={32} className="text-muted-foreground mb-4" strokeWidth={1.5} />
          <p className="text-sm font-medium mb-1">Wishlist masih kosong</p>
          <p className="text-xs text-muted-foreground mb-6">Barang yang Anda simpan akan muncul di sini.</p>
          <Link href="/" className="text-xs font-medium underline underline-offset-2 hover:text-muted-foreground">
            Cari Barang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <AdCard key={item.id} ad={item.ad} />
          ))}
        </div>
      )}
    </div>
  );
}
