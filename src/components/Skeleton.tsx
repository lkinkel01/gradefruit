'use client';

import styles from './Skeleton.module.css';

/**
 * Platzhalter in der Form dessen, was gleich kommt.
 *
 * Ein Kreisel sagt „warte", zeigt aber nicht, worauf. Am Handy fällt jede
 * Wartezeit auf, und eine weiße Fläche wirkt wie ein Fehler. Blöcke in der
 * Größe des echten Inhalts lassen die Seite stattdessen schon stehen, bevor
 * sie da ist — deshalb machen Apps das so.
 */
export function SkeletonZeile({ breite = '100%' }: { breite?: string }) {
  return <span className={styles.zeile} style={{ width: breite }} aria-hidden="true" />;
}

/** Liste aus Platzhalter-Zeilen, wie sie ein Inhaltsverzeichnis hätte. */
export function SkeletonListe({ anzahl = 6 }: { anzahl?: number }) {
  return (
    <div className={styles.liste} role="status" aria-label="Inhalte werden geladen">
      {Array.from({ length: anzahl }).map((_, index) => (
        <div key={index} className={styles.reihe}>
          <span className={styles.punkt} aria-hidden="true" />
          <span className={styles.text}>
            <SkeletonZeile breite={`${58 + ((index * 13) % 34)}%`} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Platzhalter für einen Textblock, etwa eine Aufgabe mit Lösungsweg. */
export function SkeletonText({ zeilen = 4 }: { zeilen?: number }) {
  return (
    <div className={styles.block} role="status" aria-label="Inhalt wird geladen">
      {Array.from({ length: zeilen }).map((_, index) => (
        <SkeletonZeile key={index} breite={index === zeilen - 1 ? '62%' : '100%'} />
      ))}
    </div>
  );
}
