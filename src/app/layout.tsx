import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Watermark from "@/components/Watermark";
import SincronarioWidget from "@/components/SincronarioWidget";

const pirataOne = localFont({
  src: "../fonts/PirataOne-Regular.ttf",
  variable: "--font-pirata-one",
  display: "swap",
});

const pompiere = localFont({
  src: "../fonts/Pompiere-Regular.ttf",
  variable: "--font-pompiere",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monje Urbano Libre",
  description: "Silencio, presencia y propósito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${pirataOne.variable} ${pompiere.variable}`}>
      <body>
        <Watermark />
        <SincronarioWidget />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
