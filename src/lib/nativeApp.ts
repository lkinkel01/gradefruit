import { useEffect, useState } from 'react';

// Erkennt, ob Gradefruit gerade in der nativen App läuft, und kapselt die
// Lernerinnerungen.
//
// Derselbe Code für alle: Im Browser meldet `imAppRahmen()` schlicht false und
// die Erinnerungen erscheinen gar nicht erst. In der App steht Capacitors
// Brücke im Fenster bereit, und die Erinnerungen sind echte System-
// Mitteilungen — sie kommen auch, wenn die App geschlossen ist.
//
// Bewusst LOKALE Mitteilungen: Sie brauchen weder einen Push-Dienst noch
// Apples Push-Zertifikate, funktionieren offline und geben keine Daten aus der
// Hand. Für eine tägliche Lernerinnerung ist das genau richtig.

const KEY = 'gf-erinnerung';
const NOTIFICATION_ID = 1;

export function imAppRahmen(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap?.isNativePlatform === 'function' ? cap.isNativePlatform() : false;
}

/** Gespeicherte Uhrzeit als "HH:MM", oder null wenn keine Erinnerung läuft. */
export function gespeicherteZeit(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

async function plugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

/** Richtet die tägliche Erinnerung ein. Gibt zurück, ob es geklappt hat. */
export async function erinnerungSetzen(zeit: string): Promise<boolean> {
  try {
    const LocalNotifications = await plugin();

    const erlaubnis = await LocalNotifications.requestPermissions();
    if (erlaubnis.display !== 'granted') return false;

    const [stunde, minute] = zeit.split(':').map(Number);
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_ID,
        title: 'Zeit für Mathe',
        body: 'Ein paar Aufgaben heute bringen dich näher ans Abi.',
        // `repeats` mit `on` heißt: jeden Tag zu dieser Uhrzeit.
        schedule: { on: { hour: stunde, minute }, repeats: true, allowWhileIdle: true },
      }],
    });

    try { localStorage.setItem(KEY, zeit); } catch { /* Speicher gesperrt */ }
    return true;
  } catch {
    return false;
  }
}

/** Schaltet die Erinnerung wieder ab. */
export async function erinnerungLoeschen(): Promise<void> {
  try {
    const LocalNotifications = await plugin();
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
  } catch { /* Nichts zu löschen */ }
  try { localStorage.removeItem(KEY); } catch { /* Speicher gesperrt */ }
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
