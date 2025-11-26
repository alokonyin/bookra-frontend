import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Bookra.com - Book Buses & Flights in East Africa",
  description: "Bookra.com – Online Travel Agency for East Africa. Book buses and flights across the region.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConditionalNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
