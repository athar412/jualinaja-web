"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type Ad = {
  id: string;
  title: string;
  price: string;
  author: { name: string; email: string };
  category: { name: string };
  images: { url: string }[];
  status: string;
  createdAt: string;
};

export default function ModerationPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch("/api/admin/ads?status=PENDING_REVIEW")
      .then((r) => r.json())
      .then((data) => setAds(data.ads || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    if (action === "reject" && !rejectReason) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    try {
      await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, rejectReason: action === "reject" ? rejectReason : undefined }),
      });
      setAds((prev) => prev.filter((ad) => ad.id !== id));
      if (action === "reject") {
        setRejectId(null);
        setRejectReason("");
      }
    } catch {
      alert("Gagal memproses aksi.");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Moderasi Iklan (Menunggu)</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : ads.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed border-border p-8 text-center bg-muted/30">
          Tidak ada iklan yang menunggu moderasi.
        </p>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="border border-border p-4 bg-background flex flex-col md:flex-row gap-6">
              {ad.images?.[0]?.url && (
                <div className="w-full md:w-40 aspect-square relative bg-muted flex-shrink-0">
                  <Image src={ad.images[0].url} alt={ad.title} fill className="object-cover" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 text-[10px] rounded-none">{ad.category.name}</Badge>
                    <h3 className="font-medium">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Rp {Number(ad.price).toLocaleString("id-ID")}</p>
                    
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <p>Oleh: {ad.author.name} ({ad.author.email})</p>
                      <p>Diposting: {new Date(ad.createdAt).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-32 flex-shrink-0">
                    {rejectId === ad.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Alasan tolak..." 
                          className="text-xs min-h-[60px]"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => setRejectId(null)}>Batal</Button>
                          <Button size="sm" variant="destructive" className="flex-1 h-7 text-[10px]" onClick={() => handleAction(ad.id, "reject")}>Tolak</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button size="sm" className="w-full h-8 text-[11px]" onClick={() => handleAction(ad.id, "approve")}>Setujui</Button>
                        <Button size="sm" variant="outline" className="w-full h-8 text-[11px]" onClick={() => setRejectId(ad.id)}>Tolak</Button>
                        <Button size="sm" variant="ghost" className="w-full h-8 text-[11px]" asChild>
                          <a href={`/ads/${ad.id}`} target="_blank">Lihat Detail</a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
