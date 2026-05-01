"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { AdImage } from "@prisma/client";

interface ImageGalleryProps {
  images: AdImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="ad-image-ratio bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Tidak ada foto</span>
      </div>
    );
  }

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails (bottom on mobile, left on desktop) */}
      {images.length > 1 && (
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:w-14 flex-shrink-0 order-2 md:order-1 pb-2 md:pb-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-14 h-14 md:h-auto md:aspect-square overflow-hidden border transition-colors ${
                i === active ? "border-foreground" : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 relative bg-muted group order-1 md:order-2">
        <div className="ad-image-ratio relative">
          <Image
            src={images[active].url}
            alt={`${title} — foto utama`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity border border-border"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity border border-border"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} className="text-muted-foreground" />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-background px-2 py-1">
            {active + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
