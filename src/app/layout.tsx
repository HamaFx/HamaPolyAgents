import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const displayFont = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AgentBets",
  description: "Multi-agent AI prediction market platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <Header />
        <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-8">
          <div className="flex gap-4">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
