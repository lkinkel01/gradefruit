import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ProgressProvider } from "@/lib/ProgressContext";

export const metadata: Metadata = {
  title: "Gradefruit",
  description: "Mathe-Abi Hessen 2027 – Grundkurs Vorbereitung",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {/* Setzt das gespeicherte Theme VOR dem ersten Rendern, damit die Seite
            nicht kurz hell aufblitzt und dann auf Dunkel springt. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('gf-theme')==='dark')document.body.classList.add('dark')}catch(e){}`,
          }}
        />
        <AuthProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
