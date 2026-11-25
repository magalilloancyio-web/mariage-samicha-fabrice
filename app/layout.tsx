import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { WEDDING } from "@/lib/config";
import "./globals.css";

const script = Great_Vibes({ variable: "--font-great-vibes", weight: "400", subsets: ["latin"] });
const serif = Cormorant_Garamond({ variable: "--font-cormorant", weight: ["500", "600", "700"], subsets: ["latin"] });
const sans = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${WEDDING.title} · Nos photos`,
  description: `Partagez vos photos du mariage de ${WEDDING.title} — ${WEDDING.shortDates}, ${WEDDING.venue}.`,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "S & F", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#efe8dc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${script.variable} ${serif.variable} ${sans.variable} min-h-dvh antialiased`}>{children}</body>
    </html>
  );
}
