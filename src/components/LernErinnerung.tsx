'use client';

import { useEffect, useState } from 'react';
import { gespeicherteZeit, imAppRahmen } from '@/lib/nativeApp';
import { erinnerungsText } from '@/lib/erinnerungstexte';
import {
  TAGE_REIHE, TAG_KURZ, planBeschreiben, planFuerPhase, planLesen, planSchreiben,
  type Plan, type Wochentag,
} from '@/lib/erinnerungsplan';
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
async function planen(plugin: Baustein, plan: Plan, prozent: number) {
  // Je Wochentag eine eigene Mitteilung. iOS kann „jeden Montag um 13:30"
  // planen, aber nicht „montags und donnerstags" in einem Eintrag — also sieben
  // mögliche Einträge mit festen Nummern, die sich sauber einzeln löschen
  // lassen.
  const alle = TAGE_REIHE.map(tag => ({ id: 10 + tag }));
  await plugin.cancel({ notifications: [{ id: 1 }, ...alle] });

  const text = erinnerungsText({
    prozent,
    tageWeg: tageSeitBesuch(),
    tageBisPruefung: daysUntilExam(),
  });

  const mitteilungen = TAGE_REIHE.filter(tag => plan[tag].an).map(tag => {
    const [stunde, minute] = plan[tag].zeit.split(':').map(Number);
    return {
      id: 10 + tag,
      title: TITEL,
      body: text,
      // `weekday` ist bei iOS 1 = Sonntag, unsere Tage sind 0 = Sonntag.
      schedule: { on: { weekday: tag + 1, hour: stunde, minute }, repeats: true },
    };
  });

  if (mitteilungen.length > 0) await plugin.schedule({ notifications: mitteilungen });

  try {
    localStorage.setItem('gf-erinnerung', plan[1].zeit);
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
  if (!gespeicherteZeit()) return;
  try {
    if (localStorage.getItem(STAND_KEY) === String(TEXT_STAND)) return;
  } catch { return; }

  const plugin = baustein();
  if (!plugin) return;
  try {
    const erlaubnis = await plugin.checkPermissions();
    if (erlaubnis.display !== 'granted') return;
    const { plan, eigen } = planLesen();
    // Wer nichts eingestellt hat, bekommt den zur Prüfungsnähe passenden Takt.
    // Wer etwas eingestellt hat, behält ihn — die App ändert eine bewusste
    // Wahl nicht hinter dem Rücken.
    await planen(plugin, eigen ? plan : planFuerPhase(daysUntilExam()), prozent);
  } catch { /* Beim nächsten Öffnen der nächste Versuch. */ }
}

export default function LernErinnerung() {
  const { totalDone, totalLessons } = useProgress();
  const prozent = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;
  const [inApp, setInApp] = useState(false);
  const [aktiv, setAktiv] = useState(false);
  const [plan, setPlan] = useState<Plan>(() => planLesen().plan);
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    setInApp(imAppRahmen());
    if (gespeicherteZeit()) setAktiv(true);
    const { plan: gelesen, eigen } = planLesen();
    setPlan(eigen ? gelesen : planFuerPhase(daysUntilExam()));
    void textNachziehen(prozent);
    // Besuch vermerken, NACHDEM der Text geplant wurde: Sonst wäre „Tage weg"
    // beim eigenen Öffnen immer 0 und die Abwesenheits-Sätze kämen nie vor.
    try { localStorage.setItem(BESUCH_KEY, String(Date.now())); } catch { /* Speicher gesperrt */ }
    // Absichtlich nur beim ersten Rendern: Der Prozentwert kommt kurz darauf
    // nach, das Nachziehen darf deshalb nicht bei jeder Änderung neu laufen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!inApp) return null;

  const anwenden = async (neuerPlan: Plan) => {
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

      await planen(plugin, neuerPlan, prozent);
      planSchreiben(neuerPlan);
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
      if (plugin) {
        await plugin.cancel({ notifications: [{ id: 1 }, ...TAGE_REIHE.map(t => ({ id: 10 + t }))] });
      }
      try { localStorage.removeItem('gf-erinnerung'); } catch { /* Speicher gesperrt */ }
      setAktiv(false);
      setOffen(false);
    } catch (fehler) {
      const text = fehler instanceof Error ? fehler.message : String(fehler);
      setMeldung(`Ausschalten hat nicht geklappt: ${text}`);
    } finally {
      setLaeuft(false);
    }
  };

  const tagUmschalten = (tag: Wochentag) => {
    setPlan(vorher => ({ ...vorher, [tag]: { ...vorher[tag], an: !vorher[tag].an } }));
  };

  const zeitSetzen = (tag: Wochentag, zeit: string) => {
    setPlan(vorher => ({ ...vorher, [tag]: { ...vorher[tag], zeit } }));
  };

  return (
    <section className={styles.box}>
      <div className={styles.kopf}>
        <strong className={styles.title}>Lernerinnerung</strong>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn light sm"
            onClick={() => setOffen(o => !o)}
            disabled={laeuft}
          >
            {offen ? 'Fertig' : 'Bearbeiten'}
          </button>
          <button
            type="button"
            className="btn light sm"
            disabled={laeuft}
            onClick={() => void (aktiv ? ausschalten() : anwenden(plan))}
          >
            {laeuft ? 'Moment …' : aktiv ? 'Ausschalten' : 'Einschalten'}
          </button>
        </div>
      </div>

      {meldung && <p className={styles.hinweis}>{meldung}</p>}

      {offen && (
        <div className={styles.plan}>
          {/* Tag antippen schaltet ihn an oder aus. Die Uhrzeit steht daneben
              und gilt nur für diesen Tag. */}
          {TAGE_REIHE.map(tag => (
            <div key={tag} className={styles.tagZeile}>
              <button
                type="button"
                className={`${styles.tag} ${plan[tag].an ? styles.tagAn : ''}`}
                onClick={() => tagUmschalten(tag)}
                aria-pressed={plan[tag].an}
              >
                {TAG_KURZ[tag]}
              </button>
              <input
                type="time"
                className={styles.zeit}
                value={plan[tag].zeit}
                onChange={e => zeitSetzen(tag, e.target.value)}
                disabled={!plan[tag].an}
                aria-label={`Uhrzeit für ${TAG_KURZ[tag]}`}
              />
            </div>
          ))}

          <button
            type="button"
            className="btn primary"
            onClick={() => { void anwenden(plan); setOffen(false); }}
            disabled={laeuft}
          >
            Übernehmen
          </button>
        </div>
      )}

      {!offen && aktiv && <p className={styles.body}>{planBeschreiben(plan)}</p>}
    </section>
  );
}
