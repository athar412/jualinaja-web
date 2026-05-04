import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JualinAja — Jual Beli Online Bandung",
    template: "%s | JualinAja",
  },
  description:
    "Platform jual beli online terpercaya untuk warga Bandung. Jual beli barang baru & bekas, bayar di tempat, tanpa ribet.",
  keywords: ["jual beli online", "jual beli Bandung", "bayar di tempat", "bekas", "baru"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "JualinAja",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
