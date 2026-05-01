"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageOpen, Users, CheckCircle, Clock, Search, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  totalAds: number;
  liveAds: number;
  pendingAds: number;
  totalUsers: number;
};

type LiveAd = {
  id: string;
  title: string;
  price: string | number;
  location: string;
  createdAt: string;
  images: { url: string }[];
  category: { name: string };
  author: { name: string; email: string };
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [liveAds, setLiveAds] = useState<LiveAd[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAds, setLoadingAds] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingAds(true);
    fetch("/api/admin/ads?status=LIVE&limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.ads) setLiveAds(data.ads);
      })
      .catch(() => {})
      .finally(() => setLoadingAds(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini? Tindakan ini tidak bisa dibatalkan.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLiveAds((prev) => prev.filter((ad) => ad.id !== id));
        // Update stats
        setStats((prev) => prev ? { ...prev, liveAds: prev.liveAds - 1, totalAds: prev.totalAds - 1 } : prev);
      } else {
        alert("Gagal menghapus iklan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatPrice(price: number | string) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price));
  }

  const filteredAds = liveAds.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.author.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.author.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.category.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-xl font-medium tracking-tight-luxury mb-6 sm:mb-8">Ringkasan Platform</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8 sm:mb-10">
        <div className="border border-border p-3 sm:p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-3 sm:mb-4">
            <PackageOpen size={14} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium truncate">Total Iklan</span>
          </div>
          <p className="text-2xl sm:text-3xl font-medium tracking-tight">{stats?.totalAds ?? "—"}</p>
        </div>

        <div className="border border-border p-3 sm:p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CheckCircle size={14} strokeWidth={1.5} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium text-muted-foreground truncate">Tayang</span>
          </div>
          <p className="text-2xl sm:text-3xl font-medium tracking-tight">{stats?.liveAds ?? "—"}</p>
        </div>

        <div className="border border-border p-3 sm:p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Clock size={14} strokeWidth={1.5} className="text-amber-600 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium text-muted-foreground truncate">Menunggu</span>
          </div>
          <p className="text-2xl sm:text-3xl font-medium tracking-tight">{stats?.pendingAds ?? "—"}</p>
        </div>

        <div className="border border-border p-3 sm:p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Users size={14} strokeWidth={1.5} className="text-blue-600 flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium text-muted-foreground truncate">Pengguna</span>
          </div>
          <p className="text-2xl sm:text-3xl font-medium tracking-tight">{stats?.totalUsers ?? "—"}</p>
        </div>
      </div>

      {/* Live Ads Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-base font-medium tracking-tight-luxury">Iklan Tayang ({filteredAds.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari judul, penjual, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {loadingAds ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-border bg-muted/30">
            <PackageOpen size={28} className="text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium mb-1">
              {searchQuery ? "Tidak ada iklan yang cocok" : "Belum ada iklan tayang"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Iklan yang sudah disetujui dan dibayar akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="border border-border p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-background transition-colors hover:border-foreground/20"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-20 h-20 bg-muted relative flex-shrink-0 overflow-hidden">
                  {ad.images?.[0]?.url ? (
                    <Image src={ad.images[0].url} alt={ad.title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <PackageOpen size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-1">
                    <h3 className="text-sm font-medium truncate">{ad.title}</h3>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 self-start flex-shrink-0">LIVE</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{formatPrice(ad.price)}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{ad.category.name}</span>
                    <span>•</span>
                    <span>{ad.location}</span>
                    <span>•</span>
                    <span>{ad.author.name || ad.author.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                  <Link href={`/ads/${ad.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] px-2.5 gap-1.5 border-border">
                      <ExternalLink size={12} /> Lihat
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px] px-2.5 text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => handleDelete(ad.id)}
                    disabled={deletingId === ad.id}
                  >
                    <Trash2 size={12} />
                    {deletingId === ad.id ? "..." : "Hapus"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
