import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ProgressProvider } from "@/lib/ProgressContext";
import { ContentProvider } from "@/lib/ContentContext";

export const metadata: Metadata = {
  title: "Gradefruit",
  description: "Mathe-Abi Hessen 2027 – Grundkurs Vorbereitung",
  // Auf dem iPhone zum Home-Bildschirm hinzugefügt startet Gradefruit dadurch
  // im Vollbild, ohne Safari-Leisten, mit eigenem Eintrag im App-Umschalter.
  appleWebApp: {
    capable: true,
    title: "Gradefruit",
    statusBarStyle: "default",
  },
  // Next gibt nur die moderne Schreibweise `mobile-web-app-capable` aus. Ältere
  // iOS-Versionen kennen ausschließlich die Apple-Variante — beide setzen.
  other: { "apple-mobile-web-app-capable": "yes" },
};

// Färbt bei iOS die Statusleiste passend zum Thema ein, statt sie hell zu
// lassen, wenn die App im Dunkelmodus läuft.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#131315" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          <ProgressProvider>
            <ContentProvider>{children}</ContentProvider>
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
