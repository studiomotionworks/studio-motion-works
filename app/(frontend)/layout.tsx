import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MagneticCursor } from "@/components/ui/MagneticCursor";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "../globals.css";
import Footer from "@/components/ui/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio Motion",
  description:
    "Bespoke kinetic sculptures, moving furnishings, and interactive installations. We don't just design objects; we design time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-body bg-void text-ink antialiased selection:bg-bronze/30 selection:text-bronze`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <MagneticCursor />
            <FloatingNav />
            <ThemeToggle />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
