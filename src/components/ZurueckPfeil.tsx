'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ZurueckPfeil.module.css';

/**
 * Ein Pfeil oben links, der dorthin zurückführt, wo man herkam.
 *
 * Warum nicht einfach ein fester Link auf die Startseite: Wer von der
 * Startseite über die Kurswahl auf eine Kursseite kommt, will zurück zur
 * Kurswahl. Wer über die Kopfleiste von „Über uns" kommt, will zurück zu
 * „Über uns". Ein fester Link wäre in einem der beiden Fälle immer falsch.
 *
 * Die Falle dabei: `router.back()` tut NICHTS, wenn jemand die Adresse direkt
 * aufgerufen hat oder von außen kommt — der Verlauf ist dann leer, und der
 * Pfeil wäre ein Knopf, bei dem nichts passiert. Deshalb wird vorher geprüft,
 * ob es überhaupt einen Schritt zurück gibt; sonst führt er auf die
 * Startseite. Geprüft wird im Effekt und nicht beim Rendern, weil es den
 * Verlauf auf dem Server nicht gibt und die Seite sonst unterschiedlich
 * ausfiele.
 */
export default function ZurueckPfeil({ beschriftung = 'Zurück' }: { beschriftung?: string }) {
  const router = useRouter();
  const [hatVerlauf, setHatVerlauf] = useState(false);

  useEffect(() => {
    setHatVerlauf(window.history.length > 1);
  }, []);

  return (
    <button
      type="button"
      className={styles.pfeil}
      onClick={() => (hatVerlauf ? router.back() : router.push('/'))}
      aria-label={beschriftung}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{beschriftung}</span>
    </button>
  );
}
