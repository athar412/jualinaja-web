"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  adId: string;
  userId: string;
}

export default function WishlistButton({ adId, userId }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already in wishlist
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSaved(data.some((w: { adId: string }) => w.adId === adId));
        }
      })
      .catch(() => {});
  }, [adId]);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
      const data = await res.json();
      setSaved(data.action === "added");
      router.refresh();
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full h-12 text-sm gap-2"
      onClick={toggle}
      disabled={loading}
    >
      <Heart
        size={16}
        strokeWidth={1.5}
        className={saved ? "fill-foreground" : ""}
      />
      {saved ? "Tersimpan di Wishlist" : "Simpan ke Wishlist"}
    </Button>
  );
}
