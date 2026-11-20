'use client';

import Link from 'next/link';
import { PREISE } from '@/lib/preise';
import styles from './KursWahl.module.css';

/**
 * Der Einstieg auf der Startseite: Kurs wählen.
 *
 * Die erste Frage, die sich jede Schülerin in Hessen stellt, ist nicht „was
 * kostet das", sondern „welchen Kurs schreibe ich eigentlich". Die Startseite
 * sprach vorher alle gleichzeitig an und niemanden persönlich.
 *
 * Wichtig ist, was NICHT hier steht: kein eigener „Kostenlos testen"-Knopf
 * mehr neben den beiden Kursen. Drei Knöpfe nebeneinander sind drei
 * Entscheidungen, und zwei davon führten vorher an denselben Ort. Jetzt gibt
 * es genau einen Schritt — den Kurs wählen — und die Entscheidung zwischen
 * kaufen und erst ansehen fällt eine Seite später, wo beide Wege nebeneinander
 * stehen und man weiß, worum es geht.
 *
 * Die Wahl wird auch gemerkt: `gf-level` steuert, welche Kursstufe die
 * Lernoberfläche später zeigt. Wer hier LK wählt, sieht danach LK-Inhalte,
 * ohne es ein zweites Mal einzustellen.
 */
const STUFEN = [
  { id: 'gk' as const, label: 'Grundkurs', pfad: '/kurse/grundkurs' },
  { id: 'lk' as const, label: 'Leistungskurs', pfad: '/kurse/leistungskurs' },
];

export default function KursWahl() {
  const merken = (id: 'gk' | 'lk') => {
    try {
      localStorage.setItem('gf-level', id);
    } catch {
      /* Speicher gesperrt: Die Stufe wird dann auf der Kursseite neu gesetzt. */
    }
  };

  return (
    <div className={styles.wahl}>
      <p className={styles.titel}>Kostenlos testen</p>
      <p className={styles.frage} id="kurswahl-frage">Wähle deinen Kurs</p>

      <div className={styles.knoepfe} aria-labelledby="kurswahl-frage">
        {STUFEN.map(s => (
          <Link
            key={s.id}
            className={styles.stufe}
            href={s.pfad}
            onClick={() => merken(s.id)}
          >
            <span className={styles.stufeName}>{s.label}</span>
            <span className={styles.stufePreis}>{PREISE[s.id].einmalig} einmalig</span>
            <span className={styles.stufePfeil} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <p className={styles.fuss}>Ohne Zahlungsdaten. Die ersten Inhalte jedes Themas sind frei.</p>
    </div>
  );
}
