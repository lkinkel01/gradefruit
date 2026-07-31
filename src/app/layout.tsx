import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ProgressProvider } from "@/lib/ProgressContext";
import { ContentProvider } from "@/lib/ContentContext";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Gradefruit",
  description: "Mathe-Abi Hessen 2027 · Grundkurs Vorbereitung",
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
        {/* Auffangnetz für den Link aus der „Passwort vergessen"-Mail.
            Ist die Zieladresse in Supabase nicht freigegeben, schickt Supabase
            den Nutzer stattdessen auf die Startseite — mitsamt dem Nachweis im
            Anker der Adresse. Ohne diese Weiterleitung landet er dann auf der
            Werbeseite und kann kein neues Passwort setzen, obwohl alles
            Nötige mitgeliefert wurde. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='/'&&location.hash.indexOf('type=recovery')>-1)location.replace('/passwort-neu'+location.hash)}catch(e){}`,
          }}
        />
        {/* Notbremse gegen den weißen Bildschirm.
            ---------------------------------------------------------------
            Der schlimmste Fehler dieser App ist der, aus dem niemand mehr
            herauskommt: Ein zwischengespeichertes Gerüst verweist auf
            Programmdateien, die es nicht mehr gibt. Die Seite lädt, findet
            ihren Code nicht — und weil sie nie startet, kann der Nutzer auch
            nichts mehr aufrufen, was das reparieren würde. Genau da saß Leon
            fest, und auf dem Handy gibt es keine Entwicklerkonsole.

            Dieses Skript läuft VOR allem anderen und hängt an keiner einzigen
            Datei. Startet die App binnen acht Sekunden nicht (sie setzt dann
            `data-gf-bereit`), räumt es Speicher und Service Worker ab und lädt
            einmal neu — alles kommt frisch aus dem Netz.

            Geräumt werden auch die Anmelde-Cookies. Ein zu großes oder kaputtes
            Sitzungs-Cookie ist genau so eine Sackgasse: Es wird bei JEDER
            Anfrage mitgeschickt, der Server weist sie ab, und die Seite kommt
            nie so weit, dass man sich abmelden könnte. Ohne Anmeldung startet
            die App wenigstens.

            Die Markierung in sessionStorage verhindert eine Schleife: höchstens
            ein Versuch je Sitzung. Hilft er nicht, liegt es an etwas anderem,
            und ein zweites Neuladen würde es auch nicht richten. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
var M='gf-selbstheilung';
setTimeout(function(){
  if(document.documentElement.getAttribute('data-gf-bereit')==='1')return;
  try{if(sessionStorage.getItem(M)==='1')return;sessionStorage.setItem(M,'1')}catch(e){return}
  var fertig=function(){location.reload()};
  var aufgaben=[];
  try{if(window.caches)aufgaben.push(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}))}catch(e){}
  try{if(navigator.serviceWorker)aufgaben.push(navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}))}catch(e){}
  try{document.cookie.split(';').forEach(function(c){var n=c.split('=')[0].trim();if(n.indexOf('sb-')===0){['/','' ].forEach(function(p){document.cookie=n+'=; Max-Age=0; path='+(p||'/');document.cookie=n+'=; Max-Age=0; path=/; domain='+location.hostname;document.cookie=n+'=; Max-Age=0; path=/; domain=.'+location.hostname.replace(/^www\./,'')})}})}catch(e){}
  try{localStorage.removeItem('gf-device-id')}catch(e){}
  Promise.all(aufgaben).then(fertig,fertig);
},8000)}catch(e){}})()`,
          }}
        />
        <AuthProvider>
          <ProgressProvider>
            <ContentProvider>
              <ServiceWorker />
              {children}
            </ContentProvider>
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
