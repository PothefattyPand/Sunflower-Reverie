import type { Metadata } from "next";
import { Suspense } from "react";
import { Caveat, Patrick_Hand, Kalam, Nunito } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getBaseUrl } from "@/lib/utils";
import "./globals.css";

export const instant = false;

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-patrick",
  display: "swap",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    template: "%s | Sunflower Reverie",
    default: "Sunflower Reverie — Where Thoughts Bloom Into Words",
  },
  description:
    "A personal, handwritten literary sanctuary inspired by sunflowers, warm sunshine, and poetic contemplation.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sunflower Reverie",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${patrickHand.variable} ${kalam.variable} ${nunito.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col font-nunito bg-[#FFF9EC] text-[#3B3028]">
        <Suspense
          fallback={
            <header className="sticky top-0 z-50 h-18 bg-[#FFF9EC]/95 border-b border-[#EADBCE]/70" />
          }
        >
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
