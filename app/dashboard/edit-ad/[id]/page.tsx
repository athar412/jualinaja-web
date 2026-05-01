"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  title: z.string().min(3).max(100).optional(),
  categoryId: z.string().optional(),
  condition: z.enum(["NEW", "USED"]).optional(),
  price: z.number().min(0).optional(),
  location: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  contactPhone: z.string().min(8).optional(),
});
type FormData = z.infer<typeof schema>;
type Category = { id: string; name: string };

export default function EditAdPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/ads/${id}`).then((r) => r.json())
    ])
      .then(([cats, ad]) => {
        setCategories(cats);
        reset({
          title: ad.title,
          categoryId: ad.categoryId,
          condition: ad.condition,
          price: Number(ad.price),
          location: ad.location,
          description: ad.description,
          contactPhone: ad.contactPhone,
        });
      })
      .catch(() => alert("Gagal mengambil data"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal mengupdate iklan");
      router.push("/dashboard/my-ads");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Edit Iklan</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground">Judul Iklan</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Kategori</Label>
              <Select onValueChange={(val) => setValue("categoryId", val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Kondisi</Label>
              <Select onValueChange={(val: "NEW" | "USED") => setValue("condition", val)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kondisi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Baru</SelectItem>
                  <SelectItem value="USED">Bekas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs uppercase tracking-widest text-muted-foreground">Harga (Rp)</Label>
            <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground">Deskripsi</Label>
            <Textarea id="description" rows={6} {...register("description")} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs uppercase tracking-widest text-muted-foreground">Lokasi</Label>
              <Input id="location" {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="text-xs uppercase tracking-widest text-muted-foreground">Nomor WhatsApp</Label>
              <Input id="contactPhone" {...register("contactPhone")} />
            </div>
          </div>
        </section>

        <div className="pt-6 flex justify-end gap-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
