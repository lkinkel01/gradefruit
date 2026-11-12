'use client';

import Link from 'next/link';
import styles from './ProduktBild.module.css';

/**
 * Eine echte Aufnahme aus dem Produkt, hell und dunkel übereinandergelegt.
 * Getauscht wird per CSS über `body.dark` — ohne JavaScript, also ohne
 * Flackern beim Themenwechsel. Die Bilder entstehen mit
 * `scripts/produktbilder.mjs`.
 */
/**
 * Versionsnummer an den Bildpfaden. Die Dateinamen bleiben gleich, wenn die
 * Aufnahmen neu entstehen — Browser zeigen dann weiter die alte Fassung.
 * Nach jedem Lauf von `scripts/produktbilder.mjs` hier hochzählen.
 */
const BILD_VERSION = '4';

export default function ProduktBild({
  name,
  alt,
  breite,
  hoehe,
  ziel,
  onKlick,
  hinweis,
}: {
  name: string;
  alt: string;
  breite: number;
  hoehe: number;
  /** Zieladresse, wenn der Klick auf eine andere Seite führt. */
  ziel?: string;
  /** Handlung auf derselben Seite — etwa der Einstieg ins Produkt. */
  onKlick?: () => void;
  /** Was beim Überfahren eingeblendet wird. */
  hinweis?: string;
}) {
  const inhalt = (
    <>
      <img src={`/produkt/${name}-hell.webp?v=${BILD_VERSION}`} alt={alt} width={breite} height={hoehe} loading="lazy" draggable={false} />
      <img src={`/produkt/${name}-dunkel.webp?v=${BILD_VERSION}`} alt="" aria-hidden="true" width={breite} height={hoehe} loading="lazy" draggable={false} />
      {/* Ein Bild, das aussieht wie das Produkt, lädt zum Klicken ein. Vorher
          passierte dabei nichts. Der Hinweis macht sichtbar, dass es weitergeht. */}
      {hinweis && <span className={styles.hinweis} aria-hidden="true">{hinweis}</span>}
    </>
  );

  /**
   * Auf der Startseite führt der Klick nicht auf eine andere Adresse, sondern
   * öffnet das Produkt im selben Dokument. Vorher stand hier ein Link auf „/",
   * und das IST die Startseite — der Klick ging also auf sich selbst und
   * sichtbar passierte nichts.
   */
  if (onKlick) {
    return (
      <button type="button" className={styles.shot} onClick={onKlick} aria-label={hinweis ?? alt}>
        {inhalt}
      </button>
    );
  }

  return (
    <Link className={styles.shot} href={ziel ?? '/'} aria-label={hinweis ?? alt}>
      {inhalt}
    </Link>
  );
}
