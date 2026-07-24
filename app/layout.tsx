import type { Metadata } from "next";
import { Unbounded, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UporBlock — Blokir Distraksi, Upload Produktif",
  description:
    "Aplikasi kontrol diri yang memblokir situs distraksi dan memaksa kamu upload video produktif setelah melewati batas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${unbounded.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <div aria-hidden className="glow-field" />
        {children}
      </body>
    </html>
  );
}
