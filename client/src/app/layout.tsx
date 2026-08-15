import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/query/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { LocationModal } from "@/components/layout/LocationModal";

export const metadata: Metadata = {
  title: "BookMyShow | Movie Tickets, Cinema Showtimes & Entertainment Events",
  description: "Book movie tickets online for IMAX 3D, 4DX, Dolby Atmos screens across Star Cineplex, Blockbuster Cinemas and major theaters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#06080e] text-slate-100 min-h-screen flex flex-col selection:bg-rose-500 selection:text-white">
        <ReactQueryProvider>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <LocationModal />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
