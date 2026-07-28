import type { MetadataRoute } from 'next';

// Macht Gradefruit auf dem Home-Bildschirm zu einer App: eigenes Icon,
// Vollbild ohne Browserleiste, eigener Eintrag im App-Umschalter.
//
// Kostet nichts, braucht keinen App Store und funktioniert auf iPhone,
// Android und Desktop gleichermaßen. Für iOS wirken zusätzlich die
// `apple-mobile-web-app-*`-Angaben in layout.tsx — Safari liest diese Datei
// nur teilweise aus.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gradefruit — Mathe-Abi Hessen 2027',
    short_name: 'Gradefruit',
    description:
      'Deine gesamte Mathe-Abiturvorbereitung an einem Ort: Aufgaben mit Schritt-für-Schritt-Lösungen, Zusammenfassungen, Erklärvideos und ein KI-Coach.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'de',
    // Muss der Seitenfarbe entsprechen, sonst blitzt beim Start ein fremder
    // Farbton auf. Werte aus globals.css (--canvas hell).
    background_color: '#F7F7F8',
    theme_color: '#F7F7F8',
    categories: ['education'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
