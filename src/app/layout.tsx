import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ImpersonationBanner } from "@/components/account/ImpersonationBanner";
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
  title: "Clariven Labs | RUO Brand & Compliance Consulting (For Research Use Only)",
  description:
    "Clariven Labs helps laboratories and research companies launch compliant research-use-only product programs — brand, infrastructure, compliance, and go-to-market, end to end. For Research Use Only.",
  keywords: [
    "RUO consulting",
    "research-use-only compliance",
    "research brand consulting",
    "RUO product launch",
    "laboratory brand consulting",
    "research company onboarding",
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
        <ImpersonationBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
