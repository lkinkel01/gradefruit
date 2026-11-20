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

  return (
    <div
      className={styles.galerie}
      onMouseEnter={() => setAngehalten(true)}
      onMouseLeave={() => setAngehalten(false)}
      onFocusCapture={() => setAngehalten(true)}
      onBlurCapture={() => setAngehalten(false)}
    >
      <div className={styles.rahmen}>
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
        {/* Die Beschriftung wechselt mit dem Bild. aria-live sorgt dafür, dass
            ein Vorleseprogramm den Wechsel mitbekommt, ohne dass der Fokus
            springt. */}
        <p className={styles.beschriftung} aria-live="polite">{jetzt.titel}</p>
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
