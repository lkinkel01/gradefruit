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
  ziel = '/',
  hinweis,
}: {
  name: string;
  alt: string;
  breite: number;
  hoehe: number;
  /** Wohin der Klick führt. Standard ist der Einstieg ins Produkt. */
  ziel?: string;
  /** Was beim Überfahren eingeblendet wird. */
  hinweis?: string;
}) {
  return (
    <Link className={styles.shot} href={ziel} aria-label={hinweis ?? alt}>
      <img src={`/produkt/${name}-hell.webp?v=${BILD_VERSION}`} alt={alt} width={breite} height={hoehe} loading="lazy" draggable={false} />
      <img src={`/produkt/${name}-dunkel.webp?v=${BILD_VERSION}`} alt="" aria-hidden="true" width={breite} height={hoehe} loading="lazy" draggable={false} />
      {/* Ein Bild, das aussieht wie das Produkt, lädt zum Klicken ein. Vorher
          passierte dabei nichts. Der Hinweis macht sichtbar, dass es weitergeht. */}
      {hinweis && <span className={styles.hinweis} aria-hidden="true">{hinweis}</span>}
    </Link>
  );
}
