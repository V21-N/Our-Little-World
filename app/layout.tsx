import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Our Little World — Tempat Privat Kita Berdua",
  description:
    "Ruang digital tertutup untuk menyimpan kenangan, cerita, dan rencana bersama pasangan.",
  icons: {
    icon: "/icon.webp",
    apple: "/icon.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}