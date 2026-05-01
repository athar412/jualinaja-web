"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Search, Heart, User, Menu, X, Plus, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-[15px] font-medium tracking-tight-luxury flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          jualinaja
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/?category=elektronik" className="hover:text-foreground transition-colors">
            Elektronik
          </Link>
          <Link href="/?category=fashion" className="hover:text-foreground transition-colors">
            Fashion
          </Link>
          <Link href="/?category=kendaraan" className="hover:text-foreground transition-colors">
            Kendaraan
          </Link>
          <Link href="/?category=properti" className="hover:text-foreground transition-colors">
            Properti
          </Link>
          <Link href="/?category=lainnya" className="hover:text-foreground transition-colors">
            Lainnya
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">


          {session?.user ? (
            <>
              <Link href="/dashboard/wishlist" className="p-2 hover:bg-muted transition-colors hidden sm:block">
                <Heart size={18} strokeWidth={1.5} />
              </Link>

              <Link href="/dashboard/post-ad">
                <Button size="sm" className="hidden sm:flex items-center gap-1.5 h-8 text-xs px-3">
                  <Plus size={14} />
                  Pasang Iklan
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-muted transition-colors">
                    <User size={18} strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/wishlist" className="flex items-center gap-2">
                      <Heart size={14} /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/my-ads" className="flex items-center gap-2">
                      <Plus size={14} /> Iklan Saya
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 text-foreground font-medium">
                          <Shield size={14} /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut size={14} /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs hidden sm:flex">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 text-xs hidden sm:flex">
                  Daftar
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="p-2 hover:bg-muted transition-colors md:hidden relative z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 text-sm">
            <Link href="/?category=elektronik" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">Elektronik</Link>
            <Link href="/?category=fashion" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">Fashion</Link>
            <Link href="/?category=kendaraan" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">Kendaraan</Link>
            <Link href="/?category=properti" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">Properti</Link>
            <Link href="/?category=lainnya" onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground">Lainnya</Link>
            {session?.user ? (
              <>
                <Link href="/dashboard/post-ad" onClick={() => setMenuOpen(false)} className="font-medium">+ Pasang Iklan</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-destructive text-sm">Keluar</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)}><Button variant="outline" size="sm" className="w-full">Masuk</Button></Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}><Button size="sm" className="w-full">Daftar</Button></Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
