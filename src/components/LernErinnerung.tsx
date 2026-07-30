'use client';

import { useEffect, useState } from 'react';
import { erinnerungLoeschen, gespeicherteZeit, imAppRahmen } from '@/lib/nativeApp';
import styles from './LernErinnerung.module.css';

/**
 * Tägliche Lernerinnerung — erscheint nur in der App.
 *
 * Der Baustein wird hier absichtlich über `window.Capacitor.Plugins`
 * angesprochen statt über einen Import: Das ist der Weg, den die App selbst
 * bereitstellt, und er scheitert nicht daran, ob ein Paket im Web-Bündel
 * korrekt auflöst. Genau daran hat der Knopf vorher nichts getan.
 *
 * Jeder Schritt schreibt mit, was er gefunden hat — ein Knopf, der stumm
 * nichts tut, ist nicht diagnostizierbar.
 */
type Baustein = {
  requestPermissions: () => Promise<{ display: string }>;
  checkPermissions: () => Promise<{ display: string }>;
  schedule: (opts: unknown) => Promise<unknown>;
  cancel: (opts: unknown) => Promise<unknown>;
};

function baustein(): Baustein | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as {
    Capacitor?: { Plugins?: Record<string, unknown> };
  }).Capacitor;
  return (cap?.Plugins?.LocalNotifications as Baustein | undefined) ?? null;
}

export default function LernErinnerung() {
  const [inApp, setInApp] = useState(false);
  const [zeit, setZeit] = useState('17:00');
  const [aktiv, setAktiv] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    setInApp(imAppRahmen());
    const gespeichert = gespeicherteZeit();
    if (gespeichert) { setZeit(gespeichert); setAktiv(true); }
  }, []);

  if (!inApp) return null;

  const einschalten = async () => {
    setLaeuft(true);
    setMeldung(null);
    try {
      const plugin = baustein();
      if (!plugin) {
        setMeldung('Der Mitteilungs-Baustein der App wurde nicht gefunden. Bitte die App in Xcode neu bauen.');
        return;
      }

      const erlaubnis = await plugin.requestPermissions();
      if (erlaubnis.display !== 'granted') {
        setMeldung(`Mitteilungen sind nicht erlaubt (${erlaubnis.display}). Das lässt sich in den iPhone-Einstellungen unter Gradefruit ändern.`);
        return;
      }

      const [stunde, minute] = zeit.split(':').map(Number);
      await plugin.cancel({ notifications: [{ id: 1 }] });
      await plugin.schedule({
        notifications: [{
          id: 1,
          title: 'Zeit für Mathe',
          body: 'Ein paar Aufgaben heute bringen dich näher ans Abi.',
          schedule: { on: { hour: stunde, minute }, repeats: true },
        }],
      });

      try { localStorage.setItem('gf-erinnerung', zeit); } catch { /* Speicher gesperrt */ }
      setAktiv(true);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      setMeldung(`Hat nicht geklappt: ${text}`);
    } finally {
      setLaeuft(false);
    }
  };

  const ausschalten = async () => {
    await erinnerungLoeschen();
    setAktiv(false);
    setMeldung(null);
  };

  return (
    <section className={styles.box}>
      <div className={styles.text}>
        <strong className={styles.title}>Tägliche Lernerinnerung</strong>
        <p className={styles.body}>
          {aktiv
            ? `Du wirst jeden Tag um ${zeit} Uhr erinnert.`
            : 'Eine kurze Mitteilung am Tag — damit Lernen nicht untergeht.'}
        </p>
        {meldung && <p className={styles.hinweis}>{meldung}</p>}
      </div>
      <div className={styles.actions}>
        <input
          type="time"
          className={styles.zeit}
          value={zeit}
          onChange={event => setZeit(event.target.value)}
          disabled={aktiv || laeuft}
          aria-label="Uhrzeit der Erinnerung"
        />
        <button
          type="button"
          className="btn light"
          disabled={laeuft}
          onClick={() => void (aktiv ? ausschalten() : einschalten())}
        >
          {laeuft ? 'Moment …' : aktiv ? 'Ausschalten' : 'Einschalten'}
        </button>
      </div>
    </section>
  );
}
