"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LOCATIONS = [
  "Bandung Kota", "Cimahi", "Cileunyi", "Dago", "Buah Batu",
  "Antapani", "Cicadas", "Cicendo", "Coblong", "Kiaracondong",
  "Lengkong", "Sumur Bandung", "Regol", "Astanaanyar",
  "Babakan Ciparay", "Bandung Kulon", "Bojongloa Kidul",
  "Bandung Wetan", "Cibeunying Kidul", "Cibeunying Kaler",
  "Sukajadi", "Sukasari", "Andir", "Gedebage", "Rancasari",
];

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  condition: z.enum(["NEW", "USED"]),
  price: z.number().min(0, "Harga tidak valid"),
  location: z.string().min(1, "Lokasi wajib dipilih"),
  detailLocation: z.string().optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  contactPhone: z.string().min(8, "Nomor WA wajib diisi"),
});

type FormData = z.infer<typeof schema>;
type Category = { id: string; name: string };

export default function PostAdPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 5) {
      alert("Maksimal 5 foto");
      return;
    }
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  async function onSubmit(data: FormData) {
    if (files.length === 0) {
      alert("Wajib upload minimal 1 foto");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload gagal");
      const { urls } = await uploadRes.json();

      // 2. Create ad
      const finalDescription = data.detailLocation 
        ? `${data.description}\n\nDetail Lokasi Tambahan: ${data.detailLocation}`
        : data.description;

      const adRes = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, description: finalDescription, imageUrls: urls }),
      });
      if (!adRes.ok) throw new Error("Gagal menyimpan iklan");

      router.push("/dashboard/my-ads");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-medium tracking-tight-luxury mb-8">Pasang Iklan Baru</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Photos */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium mb-1">Foto Barang</h2>
            <p className="text-xs text-muted-foreground">Upload maksimal 5 foto (Max 5MB/foto). Foto pertama akan menjadi cover utama.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={file.name + index} className="aspect-square relative border border-border group bg-muted">
                <Image src={file.preview} alt="preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-background border border-border p-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                >
                  <X size={14} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-background text-[10px] px-1 border border-border uppercase tracking-widest font-medium">Cover</span>
                )}
              </div>
            ))}

            {files.length < 5 && (
              <div
                {...getRootProps()}
                className={`aspect-square border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragActive ? "bg-muted border-foreground" : "hover:bg-muted/50"
                }`}
              >
                <input {...getInputProps()} />
                <ImagePlus size={20} className="text-muted-foreground mb-2" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Upload</span>
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium mb-4 pb-2 border-b border-border">Detail Barang</h2>
          
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground">Judul Iklan</Label>
            <Input id="title" placeholder="Contoh: iPhone 13 Pro Max 256GB" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Kategori</Label>
              <Select onValueChange={(val) => setValue("categoryId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Kondisi</Label>
              <Select onValueChange={(val: "NEW" | "USED") => setValue("condition", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Baru</SelectItem>
                  <SelectItem value="USED">Bekas</SelectItem>
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs uppercase tracking-widest text-muted-foreground">Harga (Rp)</Label>
            <Input id="price" type="number" placeholder="0" {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground">Deskripsi Lengkap</Label>
            <Textarea id="description" rows={6} placeholder="Jelaskan spesifikasi, kelengkapan, minus (jika ada)..." {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium mb-4 pb-2 border-b border-border">Lokasi & Kontak Penjual</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Lokasi / Kecamatan (Bandung)</Label>
              <Select onValueChange={(val) => setValue("location", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="text-xs uppercase tracking-widest text-muted-foreground">Nomor WhatsApp</Label>
              <Input id="contactPhone" placeholder="0812..." {...register("contactPhone")} />
              {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone.message}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="detailLocation" className="text-xs uppercase tracking-widest text-muted-foreground">Detail Lokasi Tambahan (Opsional)</Label>
              <Input id="detailLocation" placeholder="Contoh: Jl. Cihampelas No. 10 (Patokan Ciwalk)" {...register("detailLocation")} />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-border flex justify-end">
          <Button type="submit" className="w-full sm:w-auto min-w-[200px]" disabled={isSubmitting}>
            {isSubmitting ? "Mengupload..." : "Kirim Iklan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
