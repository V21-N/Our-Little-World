import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Yugma: Tempat Privat Kita Berdua",
    template: "%s | Yugma",
  },
  description:
    "Ruang digital tertutup untuk menyimpan kenangan, cerita, dan rencana bersama pasangan. Privat, tanpa medsos, tanpa algoritma.",
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Yugma",
    locale: "id_ID",
    url: "/",
    title: "Yugma: Tempat Privat Kita Berdua",
    description:
      "Ruang digital tertutup untuk menyimpan kenangan, surat, dan rencana bersama pasangan. Privat, tanpa medsos, tanpa algoritma.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Yugma — ruang privat pasangan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yugma: Tempat Privat Kita Berdua",
    description:
      "Ruang digital tertutup untuk menyimpan kenangan, surat, dan rencana bersama pasangan.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/Yugma-Icon.svg",
    apple: "/apple-icon-180.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  name: "Yugma",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  description:
                    "Ruang digital privat untuk dua orang — menyimpan kenangan, surat, playlist, dan rencana bersama tanpa distraksi dunia luar.",
                  url: new URL(
                    process.env.VERCEL_URL
                      ? `https://${process.env.VERCEL_URL}`
                      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                  ).origin,
                  inLanguage: "id",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "IDR",
                  },
                },
                {
                  "@type": "Organization",
                  name: "Yugma",
                  url: new URL(
                    process.env.VERCEL_URL
                      ? `https://${process.env.VERCEL_URL}`
                      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                  ).origin,
                  logo: "/Yugma-Icon.svg",
                  description:
                    "Yugma adalah ruang privat digital untuk pasangan — dua pribadi, satu ikatan, satu perjalanan.",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}