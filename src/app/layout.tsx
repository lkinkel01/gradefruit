import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gradefruit — Mathe-Abi",
  description: "Mathe-Abi Hessen 2027 – Grundkurs Vorbereitung",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
