import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PromoBanner } from "@/components/products/PromoBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clarivenlabs.com"),
  title: "Clariven Labs | Research-Grade Peptide Supply (For Research Use Only)",
  description:
    "Clariven Labs delivers research-grade peptides with ≥98% purity to academic labs, biotech, and research institutions. cGMP-manufactured, COA-verified, USA-made. For Research Use Only — not for human consumption.",
  keywords: [
    "research peptides",
    "research-use-only peptides",
    "RUO peptides",
    "BPC-157",
    "research-grade peptides",
    "cGMP peptides",
    "peptide supplier USA",
    "COA-verified peptides",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <PromoBanner />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
