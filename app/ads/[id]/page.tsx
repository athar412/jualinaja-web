import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageGallery from "@/components/ads/ImageGallery";
import WishlistButton from "@/components/ads/WishlistButton";
import { MapPin, Phone, MessageCircle, Calendar, Eye, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

async function getAd(id: string) {
  return prisma.ad.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      author: {
        select: { id: true, name: true, image: true, phone: true, createdAt: true },
      },
      _count: { select: { wishlists: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ad = await prisma.ad.findUnique({ where: { id }, select: { title: true, description: true } });
  if (!ad) return { title: "Iklan tidak ditemukan" };
  return {
    title: ad.title,
    description: ad.description.slice(0, 155),
  };
}

function formatPrice(price: number | string | { toString(): string }) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ad, session] = await Promise.all([getAd(id), auth()]);

  if (!ad) notFound();

  // If ad is not approved, only author and admin can see it
  if (ad.status !== "LIVE") {
    if (!session?.user) notFound();
    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && session.user.id !== ad.authorId) {
      notFound();
    }
  }

  // Increment view count async
  prisma.ad.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const waNumber = ad.contactPhone.replace(/\D/g, "").replace(/^0/, "62");
  const waMessage = encodeURIComponent(
    `Halo, saya tertarik dengan iklan "${ad.title}" di JualinAja. Apakah masih tersedia?`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Gallery */}
          <div>
            <ImageGallery images={ad.images} title={ad.title} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Tag size={11} strokeWidth={1.5} />
              {ad.category.name}
            </p>

            {/* Title + Price */}
            <div>
              <h1 className="text-2xl font-medium tracking-tight-luxury leading-snug mb-3">
                {ad.title}
              </h1>
              <p className="text-2xl font-medium">{formatPrice(ad.price)}</p>
            </div>

            <Separator />

            {/* Meta */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} strokeWidth={1.5} />
                <span>{ad.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag size={14} strokeWidth={1.5} />
                <span>Kondisi: <span className="text-foreground">{ad.condition === "NEW" ? "Baru" : "Bekas"}</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} strokeWidth={1.5} />
                <span>Diposting: {formatDate(ad.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye size={14} strokeWidth={1.5} />
                <span>{ad.viewCount} kali dilihat</span>
              </div>
            </div>

            <Separator />

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-12 text-sm gap-2">
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Hubungi Penjual via WhatsApp
                </Button>
              </a>
              <a href={`tel:${ad.contactPhone}`}>
                <Button variant="outline" className="w-full h-12 text-sm gap-2">
                  <Phone size={16} strokeWidth={1.5} />
                  {ad.contactPhone}
                </Button>
              </a>
              {session?.user && (
                <WishlistButton adId={ad.id} userId={session.user.id} />
              )}
            </div>

            <Separator />

            {/* Seller */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Penjual</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {ad.author.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{ad.author.name ?? "Anonim"}</p>
                  <p className="text-xs text-muted-foreground">
                    Bergabung {formatDate(ad.author.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 max-w-2xl">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Deskripsi</p>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {ad.description}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
