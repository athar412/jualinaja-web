"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Camera, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

const banners = [
  {
    id: 1,
    label: "Platform",
    title: "Jual Beli Tanpa Ribet,\nKhusus Warga Bandung.",
    subtitle:
      "Platform iklan baris C2C terpercaya — temukan barang baru & bekas, negosiasi langsung, dan COD di area Bandung.",
    cta: { text: "Mulai Jelajahi", href: "/" },
    ctaSecondary: { text: "Pasang Iklan", href: "/dashboard/post-ad" },
    icon: MapPin,
  },
  {
    id: 2,
    label: "Cara Kerja",
    title: "Pasang Iklan dalam\n4 Langkah Mudah.",
    subtitle:
      "Klik Pasang Iklan → Unggah foto barang → Isi detail & harga → Iklan langsung tayang. Otomatis terhubung ke Instagram untuk jangkauan lebih luas.",
    cta: { text: "Pasang Iklan Sekarang", href: "/dashboard/post-ad" },
    ctaSecondary: null,
    icon: Camera,
    steps: [
      { num: "01", text: "Buat Akun" },
      { num: "02", text: "Upload Foto" },
      { num: "03", text: "Isi Detail" },
      { num: "04", text: "Tayang!" },
    ],
  },
  {
    id: 3,
    label: "Keamanan",
    title: "Transaksi Aman,\nTanpa Khawatir.",
    subtitle:
      "Periksa detail barang sebelum membeli. Gunakan sistem COD untuk keamanan. Laporkan penjual mencurigakan melalui platform kami.",
    cta: { text: "Daftar Sekarang", href: "/register" },
    ctaSecondary: null,
    icon: ShieldCheck,
    tips: [
      "Cek kondisi barang saat COD",
      "Jangan transfer sebelum bertemu",
      "Laporkan jika ada kecurigaan",
    ],
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioning = useRef(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setCurrentIndex(index);
    setTimeout(() => {
      isTransitioning.current = false;
    }, 600);
  }, []);

  const nextSlide = useCallback(() => {
    if (isTransitioning.current) return;
    goTo(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, goTo]);

  const prevSlide = useCallback(() => {
    if (isTransitioning.current) return;
    goTo(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]); // nextSlide changes when currentIndex changes, resetting the timer

  const banner = banners[currentIndex];
  const Icon = banner.icon;

  return (
    <section className="relative w-full border border-border bg-background overflow-hidden group">
      {/* Slide counter */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {String(currentIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </span>
      </div>

      {/* Label */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium border border-border px-2 py-1">
          {banner.label}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[220px] md:min-h-[340px] flex items-center">
        <div className="w-full px-6 md:px-12 py-14 md:py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-12 items-center">
            {/* Text Column */}
            <div className="space-y-4 md:space-y-5">
              <h2
                key={`title-${currentIndex}`}
                className="text-xl sm:text-2xl md:text-4xl font-medium tracking-tight-luxury leading-tight animate-[slideUpFade_0.5s_ease-out_forwards]"
                style={{ whiteSpace: "pre-line", opacity: 0 }}
              >
                {banner.title}
              </h2>

              <p
                key={`sub-${currentIndex}`}
                className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg animate-[slideUpFade_0.5s_ease-out_0.1s_forwards]"
                style={{ opacity: 0 }}
              >
                {banner.subtitle}
              </p>

              {/* Steps (Slide 2) */}
              {banner.steps && (
                <div
                  key={`steps-${currentIndex}`}
                  className="flex flex-wrap gap-3 md:gap-4 pt-1 animate-[slideUpFade_0.5s_ease-out_0.15s_forwards]"
                  style={{ opacity: 0 }}
                >
                  {banner.steps.map((step) => (
                    <div
                      key={step.num}
                      className="flex items-center gap-2 text-xs border border-border px-3 py-2"
                    >
                      <span className="font-medium text-foreground">{step.num}</span>
                      <span className="text-muted-foreground">{step.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips (Slide 3) */}
              {banner.tips && (
                <ul
                  key={`tips-${currentIndex}`}
                  className="space-y-2 pt-1 animate-[slideUpFade_0.5s_ease-out_0.15s_forwards]"
                  style={{ opacity: 0 }}
                >
                  {banner.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 bg-foreground rounded-full mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTAs */}
              <div
                key={`cta-${currentIndex}`}
                className="flex items-center gap-3 pt-2 animate-[slideUpFade_0.5s_ease-out_0.2s_forwards]"
                style={{ opacity: 0 }}
              >
                <Link
                  href={banner.cta.href}
                  className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-medium px-5 py-2.5 hover:opacity-80 transition-opacity"
                >
                  {banner.cta.text}
                  <ChevronRight size={14} />
                </Link>
                {banner.ctaSecondary && (
                  <Link
                    href={banner.ctaSecondary.href}
                    className="inline-flex items-center gap-1.5 border border-border text-xs font-medium px-5 py-2.5 hover:bg-muted transition-colors"
                  >
                    <Plus size={14} />
                    {banner.ctaSecondary.text}
                  </Link>
                )}
              </div>
            </div>

            {/* Icon Column (Desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <div
                key={`icon-${currentIndex}`}
                className="w-24 h-24 border border-border flex items-center justify-center animate-[slideUpFade_0.5s_ease-out_forwards]"
                style={{ opacity: 0 }}
              >
                <Icon size={32} strokeWidth={1} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Navigation */}
      <div className="border-t border-border flex items-center justify-between px-4 md:px-6 py-3">
        {/* Dots */}
        <div className="flex items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className="relative h-5 flex items-center"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block h-[1px] transition-all duration-500 ${
                  index === currentIndex
                    ? "w-8 bg-foreground"
                    : "w-4 bg-border hover:bg-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevSlide}
            className="p-2 border border-border hover:bg-muted transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 border border-border hover:bg-muted transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[1px] bg-border">
        <div
          key={`progress-${currentIndex}`}
          className="h-full bg-foreground animate-[progressBar_6s_linear]"
        />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
