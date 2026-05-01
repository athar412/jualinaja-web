"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONDITIONS = [
  { value: "", label: "Semua Kondisi" },
  { value: "NEW", label: "Baru" },
  { value: "USED", label: "Bekas" },
];

const LOCATIONS = [
  "Bandung Kota", "Cimahi", "Cileunyi", "Dago", "Buah Batu",
  "Antapani", "Cicadas", "Cicendo", "Coblong", "Kiaracondong",
  "Lengkong", "Sumur Bandung", "Regol", "Astanaanyar",
  "Babakan Ciparay", "Bandung Kulon", "Bojongloa Kidul",
  "Bandung Wetan", "Cibeunying Kidul", "Cibeunying Kaler",
  "Sukajadi", "Sukasari", "Andir", "Gedebage", "Rancasari",
];

type Category = { id: string; name: string; slug: string };

interface FilterBarProps {
  categories: Category[];
}



function FilterBarInner({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") || "");

  const activeCategory = searchParams.get("category") || "";
  const activeCondition = searchParams.get("condition") || "";
  const activeLocation = searchParams.get("location") || "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => router.push(`/?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  function clearAll() {
    setQ("");
    startTransition(() => router.push("/"));
  }

  const hasFilters = activeCategory || activeCondition || activeLocation || searchParams.get("q");

  return (
    <div className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
        {/* Search row */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari barang..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="h-9" disabled={isPending}>
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter</span>
            {hasFilters && (
              <span className="w-1.5 h-1.5 bg-foreground rounded-full" />
            )}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-muted-foreground"
              onClick={clearAll}
            >
              <X size={14} />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </form>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => updateParam("category", "")}
            className={`flex-shrink-0 text-xs px-3 py-1.5 border transition-colors ${
              !activeCategory
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 border transition-colors ${
                activeCategory === cat.slug
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            {/* Condition */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Kondisi</p>
              <div className="flex gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateParam("condition", c.value)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      activeCondition === c.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Lokasi</p>
              <select
                value={activeLocation}
                onChange={(e) => updateParam("location", e.target.value)}
                className="w-full text-xs border border-border bg-background px-3 py-2 focus:outline-none focus:border-foreground transition-colors"
              >
                <option value="">Semua Kota</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilterBar({ categories }: FilterBarProps) {
  return (
    <Suspense fallback={<div className="h-[73px] border-b border-border" />}>
      <FilterBarInner categories={categories} />
    </Suspense>
  );
}
