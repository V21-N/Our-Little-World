import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yugma: Tempat Privat Kita Berdua",
  description:
    "Ruang digital tertutup untuk menyimpan kenangan, cerita, dan rencana bersama pasangan.",
  manifest: "/manifest.json",
  icons: {
    icon: "/Yugma-Icon.svg",
    apple: "/Yugma-Icon.svg",
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
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster />
          <PwaRegister />
        </TooltipProvider>
      </body>
    </html>
  );
}