'use client';

import styles from './ProduktBild.module.css';

/**
 * Eine echte Aufnahme aus dem Produkt, hell und dunkel übereinandergelegt.
 * Getauscht wird per CSS über `body.dark` — ohne JavaScript, also ohne
 * Flackern beim Themenwechsel. Die Bilder entstehen mit
 * `scripts/produktbilder.mjs`.
 */
export default function ProduktBild({
  name,
  alt,
  breite,
  hoehe,
}: {
  name: string;
  alt: string;
  breite: number;
  hoehe: number;
}) {
  return (
    <div className={styles.shot}>
      <img src={`/produkt/${name}-hell.webp`} alt={alt} width={breite} height={hoehe} loading="lazy" draggable={false} />
      <img src={`/produkt/${name}-dunkel.webp`} alt="" aria-hidden="true" width={breite} height={hoehe} loading="lazy" draggable={false} />
    </div>
  );
}
