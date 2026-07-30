import { useEffect, useState } from 'react';

// Erkennt, ob Gradefruit gerade in der nativen App läuft.
//
// Derselbe Code für alle: Im Browser meldet `imAppRahmen()` schlicht false, und
// alles Native bleibt unsichtbar. In der App steht Capacitors Brücke im Fenster
// bereit.
//
// Hier standen einmal auch `erinnerungSetzen`/`erinnerungLoeschen`, die den
// Mitteilungs-Baustein per `import` holten. Genau dieser Weg hat in der App nie
// gegriffen — er war der Grund, warum sich die Erinnerung anschalten, aber nie
// abschalten ließ. Ersetzt durch den Brücken-Weg in `LernErinnerung.tsx`; die
// toten Fassungen sind entfernt, damit niemand versehentlich den Text dort
// pflegt, wo er nichts bewirkt.

const KEY = 'gf-erinnerung';

export function imAppRahmen(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap?.isNativePlatform === 'function' ? cap.isNativePlatform() : false;
}

/** Gespeicherte Uhrzeit als "HH:MM", oder null wenn keine Erinnerung läuft. */
export function gespeicherteZeit(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

/**
 * Wie `imAppRahmen()`, aber als Hook — und erst nach dem ersten Rendern wahr.
 *
 * Wichtig so: Auf dem Server weiß niemand, ob die Seite später in der App
 * läuft. Würde direkt beim Rendern etwas ausgeblendet, käme es zu einer
 * Abweichung zwischen Server und Browser. Deshalb startet der Wert auf false
 * und wird nach dem Einhängen korrigiert.
 */
export function useImAppRahmen(): boolean {
  const [inApp, setInApp] = useState(false);
  useEffect(() => { setInApp(imAppRahmen()); }, []);
  return inApp;
}
