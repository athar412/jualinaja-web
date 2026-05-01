import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JualinAja — Iklan Baris Bandung",
    template: "%s | JualinAja",
  },
  description:
    "Platform iklan baris C2C terpercaya untuk warga Bandung. Jual beli barang baru & bekas, COD, tanpa ribet.",
  keywords: ["iklan baris", "jual beli", "COD Bandung", "bekas", "C2C"],
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
