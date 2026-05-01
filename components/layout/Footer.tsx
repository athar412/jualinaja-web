import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-[15px] font-medium tracking-tight-luxury">
              jualinaja
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-48">
              Platform iklan baris C2C untuk warga Bandung. Jual beli barang dengan mudah, aman, dan COD langsung.
            </p>
          </div>

          {/* Jelajahi */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4">Jelajahi</p>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><Link href="/?category=elektronik" className="hover:text-foreground transition-colors">Elektronik</Link></li>
              <li><Link href="/?category=fashion" className="hover:text-foreground transition-colors">Fashion</Link></li>
              <li><Link href="/?category=kendaraan" className="hover:text-foreground transition-colors">Kendaraan</Link></li>
              <li><Link href="/?category=properti" className="hover:text-foreground transition-colors">Properti</Link></li>
              <li><Link href="/?category=hobi" className="hover:text-foreground transition-colors">Hobi</Link></li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4">Akun</p>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link></li>
              <li><Link href="/dashboard/post-ad" className="hover:text-foreground transition-colors">Pasang Iklan</Link></li>
              <li><Link href="/dashboard/my-ads" className="hover:text-foreground transition-colors">Iklan Saya</Link></li>
              <li><Link href="/dashboard/wishlist" className="hover:text-foreground transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-4">Info</p>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><span>Bandung, Jawa Barat</span></li>
              <li><span>Transaksi via COD</span></li>
              <li><span>Kontak via WhatsApp</span></li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {year} JualinAja. Hak cipta dilindungi.</p>
          <p>Dibuat dengan ❤ untuk komunitas Bandung</p>
        </div>
      </div>
    </footer>
  );
}
