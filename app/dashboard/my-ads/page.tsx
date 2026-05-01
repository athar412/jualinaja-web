"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PackageOpen, ExternalLink, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Ad, AdImage, Category } from "@prisma/client";

type AdWithRelations = Ad & {
  images: AdImage[];
  category: Category;
};

export default function MyAdsPage() {
  const [ads, setAds] = useState<AdWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch user's ads by using the generic search and filtering by authorId,
    // or we can just fetch all ads and filter here for simplicity since the backend 
    // doesn't have a dedicated /my-ads endpoint yet. 
    // Actually, we can fetch from the API directly with a specific endpoint or update the API.
    // Assuming /api/ads with a specific param or a dedicated fetch:
    fetch("/api/user/ads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini?")) return;
    
    try {
      await fetch(`/api/ads/${id}`, { method: "DELETE" });
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch {
      alert("Gagal menghapus iklan.");
    }
  }

  async function markAsSold(id: string) {
    try {
      await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, status: "SOLD" } : ad)));
    } catch {
      alert("Gagal memperbarui status.");
    }
  }

  async function handlePayment(adId: string) {
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Gagal membuat pembayaran.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  }

  function formatPrice(price: number | string | { toString(): string }) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price));
  }

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium tracking-tight-luxury">Iklan Saya</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-medium tracking-tight-luxury">Iklan Saya</h1>
        <Link href="/dashboard/post-ad">
          <Button size="sm" className="h-9 text-xs">Pasang Iklan</Button>
        </Link>
      </div>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border bg-muted/30">
          <PackageOpen size={32} className="text-muted-foreground mb-4" strokeWidth={1.5} />
          <p className="text-sm font-medium mb-1">Belum ada iklan</p>
          <p className="text-xs text-muted-foreground mb-6">Mulai hasilkan uang dengan menjual barang yang tidak terpakai.</p>
          <Link href="/dashboard/post-ad">
            <Button size="sm" className="h-9 text-xs">Pasang Iklan Sekarang</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="border border-border p-4 flex flex-col sm:flex-row gap-4 relative group bg-background transition-colors hover:border-foreground/30">
              {/* Image */}
              <div className="w-full sm:w-32 aspect-[4/3] bg-muted relative flex-shrink-0">
                {ad.images?.[0]?.url && (
                  <Image src={ad.images[0].url} alt={ad.title} fill className="object-cover" sizes="128px" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-sm font-medium truncate">{ad.title}</h3>
                    <StatusBadge status={ad.status} />
                  </div>
                  <p className="text-sm font-medium mb-1">{formatPrice(ad.price)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ad.description}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/ads/${ad.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] px-2.5 gap-1.5 border-border">
                      <ExternalLink size={12} /> Lihat
                    </Button>
                  </Link>
                  <Link href={`/dashboard/edit-ad/${ad.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] px-2.5 gap-1.5 border-border">
                      <Pencil size={12} /> Edit
                    </Button>
                  </Link>
                  {ad.status === "AWAITING_PAYMENT" && (
                    <Button 
                      className="h-8 text-[11px] px-2.5 gap-1.5 bg-blue-600 hover:bg-blue-700" 
                      onClick={() => handlePayment(ad.id)}
                    >
                      Bayar Rp 10.000
                    </Button>
                  )}
                  {ad.status === "LIVE" && (
                    <Button variant="outline" size="sm" className="h-8 text-[11px] px-2.5 border-border" onClick={() => markAsSold(ad.id)}>
                      Tandai Terjual
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] px-2.5 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ad.id)}>
                    <Trash2 size={12} /> Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
