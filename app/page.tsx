import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterBar from "@/components/ads/FilterBar";
import AdCard from "@/components/ads/AdCard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Discover — JualinAja Bandung",
  description: "Temukan ribuan iklan baris Bandung: elektronik, fashion, kendaraan, properti dan lebih banyak lagi.",
};

async function getAds(searchParams: Record<string, string>) {
  const q = searchParams.q || "";
  const category = searchParams.category || "";
  const condition = searchParams.condition || "";
  const location = searchParams.location || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "LIVE" as const,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(condition && { condition: condition as "NEW" | "USED" }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.ad.count({ where }),
  ]);

  return { ads, total, page, totalPages: Math.ceil(total / limit) };
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

function AdGrid({ ads }: { ads: Awaited<ReturnType<typeof getAds>>["ads"] }) {
  if (ads.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-sm">Tidak ada iklan ditemukan.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {ads.map((ad: any) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {Array.from({ length: 8 }).map((_, i) => (
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
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [{ ads, total, page, totalPages }, categories] = await Promise.all([
    getAds(params),
    getCategories(),
  ]);

  const q = params.q;
  const category = params.category;
  const heading = q
    ? `Hasil untuk "${q}"`
    : category
      ? categories.find((c: any) => c.slug === category)?.name ?? "Semua Iklan"
      : "Semua Iklan";

  return (
    <>
      <Navbar />
      <FilterBar categories={categories} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Heading row */}
        <div className="flex items-baseline justify-between mb-10">
          <h1 className="text-2xl font-medium tracking-tight-luxury">
            {heading}
          </h1>
          <p className="text-xs text-muted-foreground">{total} iklan</p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <AdGrid ads={ads} />
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const href = `/?${new URLSearchParams({ ...params, page: String(p) })}`;
              return (
                <a
                  key={p}
                  href={href}
                  className={`w-8 h-8 flex items-center justify-center text-xs border transition-colors ${p === page
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                    }`}
                >
                  {p}
                </a>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
