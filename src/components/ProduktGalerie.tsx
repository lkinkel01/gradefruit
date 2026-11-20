'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './ProduktGalerie.module.css';

/**
 * Eine kleine Galerie echter Aufnahmen aus dem Produkt, die von allein
 * weiterläuft und per Pfeil bedient werden kann.
 *
 * Warum überhaupt: Ein einzelnes Standbild zeigt genau eine Stelle. Wer die
 * Seite zum ersten Mal sieht, weiß danach, dass es Lösungswege gibt, aber
 * nicht, dass es auch Zusammenfassungen, Videos und ein Wiederholungssystem
 * gibt. Die Galerie führt in vier Bildern einmal durch den Kurs.
 *
 * Drei Dinge, die eine Galerie sonst nervig machen und hier bewusst anders
 * gelöst sind:
 *
 * 1. Sie hält an, sobald jemand mit ihr zu tun hat — beim Überfahren, beim
 *    Tastaturfokus und sobald einmal ein Pfeil gedrückt wurde. Eine Galerie,
 *    die unter dem Finger weiterspringt, verliert man.
 * 2. Wer „Bewegung reduzieren" eingestellt hat, bekommt gar keinen
 *    Selbstlauf. Das ist keine Deko, sondern genau die Art Bewegung, die
 *    Leuten mit Reizempfindlichkeit zu schaffen macht.
 * 3. Alle Bilder liegen im Dokument und werden nur aus- und eingeblendet.
 *    So springt die Höhe beim Wechsel nicht, und die Beschriftung kann
 *    vorgelesen werden.
 */

export interface GalerieBild {
  /** Dateiname ohne Endung und ohne -hell/-dunkel. */
  name: string;
  /** Was auf dem Bild zu sehen ist — steht als Beschriftung darunter. */
  titel: string;
  alt: string;
}

const WECHSEL_MS = 4200;

export default function ProduktGalerie({
  bilder,
  version,
  breite,
  hoehe,
}: {
  bilder: GalerieBild[];
  version: string;
  breite: number;
  hoehe: number;
}) {
  const [aktiv, setAktiv] = useState(0);
  const [angehalten, setAngehalten] = useState(false);
  /* Zustand, nicht Ref: Eine Ref ändert sich stumm. Der Effekt unten lief
     dann mit dem alten Wert weiter, und die Galerie sprang nach dem
     Pfeildruck trotzdem von allein weiter — genau das Verhalten, das der
     Griff zum Pfeil beenden soll. */
  const [selbstGesteuert, setSelbstGesteuert] = useState(false);

  const zeige = useCallback((i: number) => {
    // Ein Griff zum Pfeil heißt: Ab jetzt bestimme ich, nicht die Uhr.
    setSelbstGesteuert(true);
    setAktiv((i + bilder.length) % bilder.length);
  }, [bilder.length]);

  useEffect(() => {
    if (angehalten || selbstGesteuert) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const uhr = window.setInterval(
      () => setAktiv(i => (i + 1) % bilder.length),
      WECHSEL_MS,
    );
    return () => window.clearInterval(uhr);
  }, [angehalten, selbstGesteuert, bilder.length]);

  const jetzt = bilder[aktiv];

  /* Wischen auf Touchgeräten.

     Die Pfeile sind auf dem Handy ausgeblendet, weil sie zu viel vom Bild
     wegnehmen. Ohne Wischen blieben dort nur die Punkte, und eine Galerie,
     die sich nicht wischen lässt, fühlt sich auf dem Handy kaputt an.

     Bewusst eigene Logik statt Scroll-Snap: Die Bilder liegen übereinander
     und werden ein- und ausgeblendet, es gibt also gar keine Scrollstrecke,
     an der etwas einrasten könnte. */
  const [tippStart, setTippStart] = useState<{ x: number; y: number } | null>(null);
  const MINDEST_WEG = 40;

  const tippBeginn = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTippStart({ x: t.clientX, y: t.clientY });
  };

  const tippEnde = (e: React.TouchEvent) => {
    if (!tippStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tippStart.x;
    const dy = t.clientY - tippStart.y;
    setTippStart(null);
    // Nur waagerechtes Wischen zählt. Ohne diesen Vergleich löst jedes
    // Hoch- und Runterscrollen über der Galerie einen Bildwechsel aus.
    if (Math.abs(dx) < MINDEST_WEG || Math.abs(dx) <= Math.abs(dy)) return;
    zeige(dx < 0 ? aktiv + 1 : aktiv - 1);
  };

  return (
    <div
      className={styles.galerie}
      onMouseEnter={() => setAngehalten(true)}
      onMouseLeave={() => setAngehalten(false)}
      onFocusCapture={() => setAngehalten(true)}
      onBlurCapture={() => setAngehalten(false)}
    >
      <div className={styles.rahmen} onTouchStart={tippBeginn} onTouchEnd={tippEnde}>
        {bilder.map((b, i) => (
          <div key={b.name} className={i === aktiv ? styles.blattAktiv : styles.blatt} aria-hidden={i !== aktiv}>
            <img
              className={styles.hell}
              src={`/produkt/${b.name}-hell.webp?v=${version}`}
              alt={i === aktiv ? b.alt : ''}
              width={breite}
              height={hoehe}
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
            />
            <img
              className={styles.dunkel}
              src={`/produkt/${b.name}-dunkel.webp?v=${version}`}
              alt=""
              aria-hidden="true"
              width={breite}
              height={hoehe}
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
            />
          </div>
        ))}

        <button
          type="button"
          className={`${styles.pfeil} ${styles.links}`}
          onClick={() => zeige(aktiv - 1)}
          aria-label="Vorheriges Bild"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.pfeil} ${styles.rechts}`}
          onClick={() => zeige(aktiv + 1)}
          aria-label="Nächstes Bild"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.fuss}>
        {/* Die sichtbare Beschriftung ist entfallen: Die Bilder zeigen die
            Oberfläche, und darin steht bereits „Zusammenfassung", „Übungen"
            und so weiter. Eine Zeile, die dasselbe noch einmal sagt, ist
            Dopplung. Für Vorleseprogramme bleibt der Titel erhalten — die
            lesen keine Bilder. */}
        <p className={styles.nurVorleser} aria-live="polite">{jetzt.titel}</p>
        <div className={styles.punkte} role="tablist" aria-label="Bild wählen">
          {bilder.map((b, i) => (
            <button
              key={b.name}
              type="button"
              role="tab"
              aria-selected={i === aktiv}
              aria-label={b.titel}
              className={i === aktiv ? styles.punktAktiv : styles.punkt}
              onClick={() => zeige(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
