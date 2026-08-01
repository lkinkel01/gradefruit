'use client';

import { useEffect, useState } from 'react';
import { BrandMark } from './BrandMark';
import styles from './Startbild.module.css';

/**
 * Was zu sehen ist, solange die App startet.
 *
 * Instagram und TikTok zeigen beim Start ihr Logo, sonst nichts. Kein Text, kein
 * Rädchen: Ein Start dauert einen Wimpernschlag, und alles, was man in dieser
 * Zeit hinschreibt, liest ohnehin niemand. „Einen Moment …" macht aus einem
 * unauffälligen Vorgang eine Wartezeit.
 *
 * Dauert es doch länger, ändert sich die Lage: Dann steht der Nutzer vor etwas,
 * das nicht funktioniert, und Schweigen ist die schlechteste Antwort. Nach acht
 * Sekunden erscheint deshalb ein Satz, nach zwanzig ein zweiter, der sagt, was
 * zu tun ist. Ein weißer Bildschirm ohne Erklärung darf es nie sein.
 */
export default function Startbild() {
  const [stufe, setStufe] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const a = window.setTimeout(() => setStufe(1), 8000);
    const b = window.setTimeout(() => setStufe(2), 20000);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, []);

  return (
    <div className={styles.seite} role="status" aria-live="polite">
      <div className={styles.mitte}>
        <span className={styles.mark}><BrandMark size={56} /></span>

        {stufe === 1 && (
          <p className={styles.text}>Einen Moment, das dauert gerade länger als sonst.</p>
        )}
        {stufe === 2 && (
          <>
            <p className={styles.text}>
              Das dauert ungewöhnlich lange. Möglicherweise laufen gerade Wartungsarbeiten.
            </p>
            <p className={styles.leise}>
              Versuch es in ein paar Minuten noch einmal. Dein Lernstand ist gespeichert.
            </p>
            <button type="button" className="btn light" onClick={() => window.location.reload()}>
              Neu laden
            </button>
          </>
        )}
      </div>
    </div>
  );
}
