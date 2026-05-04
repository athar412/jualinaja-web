"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "Selamat Datang di JualinAja! 🎉",
    subtitle:
      "Platform terpercaya untuk jual beli barang bekas & baru. Temukan barang impianmu hari ini!",
    bgClass: "bg-gradient-to-r from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "Cara Mudah Pasang Iklan 🚀",
    subtitle:
      "1. Klik tombol Pasang Iklan. 2. Unggah foto barang terbaikmu. 3. Isi detail & harga. 4. Iklan langsung tayang dan otomatis masuk ke Instagram!",
    bgClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  {
    id: 3,
    title: "Tips Transaksi Aman 🛡️",
    subtitle:
      "Periksa detail barang sebelum membeli. Jangan transfer di luar platform jika ragu. Laporkan penjual mencurigakan.",
    bgClass: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-48 md:h-[400px] rounded-2xl shadow-lg overflow-hidden group">
      {/* Carousel Track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-full h-full flex flex-col items-center justify-center text-center p-6 md:p-12 ${banner.bgClass} text-white`}
          >
            <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6 tracking-tight drop-shadow-md">
              {banner.title}
            </h2>
            <p className="text-sm md:text-xl max-w-2xl font-medium drop-shadow leading-relaxed">
              {banner.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-4 md:w-6"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
