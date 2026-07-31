'use client';

import { useEffect, useState } from 'react';
import { gespeicherteZeit, imAppRahmen } from '@/lib/nativeApp';
import { erinnerungsText } from '@/lib/erinnerungstexte';
import { daysUntilExam } from '@/lib/exam';
import { useProgress } from '@/lib/ProgressContext';
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

// Oben steht immer die Marke. Der Satz darunter richtet sich nach dem Stand
// des Nutzers und wird bei jedem Planen neu bestimmt (siehe
// src/lib/erinnerungstexte.ts).
const TITEL = 'Gradefruit';

// Wann war der Nutzer zuletzt da? Wird beim Öffnen der App gesetzt und dient
// nur der Mitteilung — der Wert bleibt auf dem Gerät.
const BESUCH_KEY = 'gf-letzter-besuch';

// iOS merkt sich den Wortlaut beim Planen, nicht beim Anzeigen: Eine schon
// laufende Erinnerung zeigt weiter den alten Text, auch wenn er hier längst
// geändert ist. Deshalb trägt der Text eine Nummer — steigt sie, plant die App
// beim nächsten Öffnen still neu.
const TEXT_STAND = 3;
const STAND_KEY = 'gf-erinnerung-text';

/** Tage seit dem letzten Öffnen der App. Ohne Eintrag: 0 (heute da gewesen). */
function tageSeitBesuch(): number {
  try {
    const roh = localStorage.getItem(BESUCH_KEY);
    if (!roh) return 0;
    const tage = Math.floor((Date.now() - Number(roh)) / 86_400_000);
    return Number.isFinite(tage) && tage > 0 ? tage : 0;
  } catch { return 0; }
}

function baustein(): Baustein | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as {
    Capacitor?: { Plugins?: Record<string, unknown> };
  }).Capacitor;
  return (cap?.Plugins?.LocalNotifications as Baustein | undefined) ?? null;
}

/**
 * Plant die tägliche Erinnerung — die einzige Stelle, die den Wortlaut kennt.
 * Sowohl das Einschalten von Hand als auch das stille Nachziehen laufen hier
 * durch, damit die Mitteilung nicht in zwei Fassungen existiert.
 */
async function planen(plugin: Baustein, zeit: string, prozent: number) {
  const [stunde, minute] = zeit.split(':').map(Number);
  await plugin.cancel({ notifications: [{ id: 1 }] });
  await plugin.schedule({
    notifications: [{
      id: 1,
      title: TITEL,
      body: erinnerungsText({ prozent, tageWeg: tageSeitBesuch(), tageBisPruefung: daysUntilExam() }),
      schedule: { on: { hour: stunde, minute }, repeats: true },
    }],
  });
  try {
    localStorage.setItem('gf-erinnerung', zeit);
    localStorage.setItem(STAND_KEY, String(TEXT_STAND));
  } catch { /* Speicher gesperrt */ }
}

/**
 * Zieht einen geänderten Wortlaut bei einer bereits laufenden Erinnerung nach.
 *
 * Ohne das würde jemand, der die Erinnerung vor der Textänderung eingeschaltet
 * hat, bis in alle Ewigkeit den alten Satz bekommen — iOS speichert ihn beim
 * Planen. Läuft bewusst stumm: kein Erlaubnis-Fenster (nur `check`, nie
 * `request`), keine Meldung, kein Ladezustand. Der Nutzer hat nichts angetippt.
 */
async function textNachziehen(prozent: number) {
  if (!imAppRahmen()) return;
  const zeit = gespeicherteZeit();
  if (!zeit) return;
  try {
    if (localStorage.getItem(STAND_KEY) === String(TEXT_STAND)) return;
  } catch { return; }

  const plugin = baustein();
  if (!plugin) return;
  try {
    const erlaubnis = await plugin.checkPermissions();
    if (erlaubnis.display !== 'granted') return;
    await planen(plugin, zeit, prozent);
  } catch { /* Beim nächsten Öffnen der nächste Versuch. */ }
}

export default function LernErinnerung() {
  const { totalDone, totalLessons } = useProgress();
  const prozent = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;
  const [inApp, setInApp] = useState(false);
  const [zeit, setZeit] = useState('17:00');
  const [aktiv, setAktiv] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    setInApp(imAppRahmen());
    const gespeichert = gespeicherteZeit();
    if (gespeichert) { setZeit(gespeichert); setAktiv(true); }
    void textNachziehen(prozent);
    // Besuch vermerken, NACHDEM der Text geplant wurde: Sonst wäre „Tage weg"
    // beim eigenen Öffnen immer 0 und die Abwesenheits-Sätze kämen nie vor.
    try { localStorage.setItem(BESUCH_KEY, String(Date.now())); } catch { /* Speicher gesperrt */ }
    // Absichtlich nur beim ersten Rendern: Der Prozentwert kommt kurz darauf
    // nach, das Nachziehen darf deshalb nicht bei jeder Änderung neu laufen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!inApp) return null;

  const neuPlanen = async (neueZeit: string) => {
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

      await planen(plugin, neueZeit, prozent);
      setAktiv(true);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      setMeldung(`Hat nicht geklappt: ${text}`);
    } finally {
      setLaeuft(false);
    }
  };

  const ausschalten = async () => {
    setLaeuft(true);
    setMeldung(null);
    try {
      // Über dieselbe Brücke wie das Einschalten. Vorher lief das Löschen über
      // den Import-Weg — also über genau den, der von Anfang an nicht griff.
      // Deshalb ließ sich die Erinnerung anschalten, aber nie abschalten.
      const plugin = baustein();
      if (plugin) await plugin.cancel({ notifications: [{ id: 1 }] });
      try { localStorage.removeItem('gf-erinnerung'); } catch { /* Speicher gesperrt */ }
      setAktiv(false);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      setMeldung(`Ausschalten hat nicht geklappt: ${text}`);
    } finally {
      setLaeuft(false);
    }
  };

  return (
    <section className={styles.box}>
      <div className={styles.text}>
        <strong className={styles.title}>Tägliche Lernerinnerung</strong>
        <p className={styles.body}>
          {aktiv
            ? `Du wirst jeden Tag um ${zeit} Uhr erinnert.`
            : 'Eine kurze Mitteilung am Tag, damit Lernen nicht untergeht.'}
        </p>
        {meldung && <p className={styles.hinweis}>{meldung}</p>}
      </div>
      <div className={styles.actions}>
        <input
          type="time"
          className={styles.zeit}
          value={zeit}
          onChange={event => {
            setZeit(event.target.value);
            // Läuft die Erinnerung schon, gilt die neue Zeit sofort — sonst
            // müsste man erst aus- und wieder einschalten.
            if (aktiv) void neuPlanen(event.target.value);
          }}
          disabled={laeuft}
          aria-label="Uhrzeit der Erinnerung"
        />
        <button
          type="button"
          className="btn light"
          disabled={laeuft}
          onClick={() => void (aktiv ? ausschalten() : neuPlanen(zeit))}
        >
          {laeuft ? 'Moment …' : aktiv ? 'Ausschalten' : 'Einschalten'}
        </button>
      </div>
    </section>
  );
}
