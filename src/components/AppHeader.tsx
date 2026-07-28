'use client';

import type { TopicTab, View } from '@/lib/types';
import styles from './AppHeader.module.css';

/**
 * Kopfzeile der App — ersetzt die Menüleiste der Website.
 *
 * Auf der Website trägt die obere Leiste Pfad, Menü-Knopf und
 * Dunkelmodus-Schalter. In der App ist das alles überflüssig: Die Navigation
 * sitzt unten, das Thema bestimmt das System. Übrig bleibt, was eine App oben
 * wirklich braucht — wo bin ich, und wie komme ich zurück.
 *
 * Auf den vier Hauptseiten gibt es keinen Zurück-Pfeil, nur den Titel.
 */
const TITEL: Partial<Record<View, string>> = {
  dashboard: 'Lernen',
  review: 'Wiederholen',
  account: 'Mein Konto',
  tutors: '1:1 Nachhilfe',
  analysis: 'Analysis',
  linalg: 'Lineare Algebra',
  stochastik: 'Stochastik',
};

const HAUPTSEITEN: View[] = ['dashboard', 'review', 'account'];

export default function AppHeader({
  view,
  topicTab,
  topicItemLabel,
  onZurueck,
}: {
  view: View;
  topicTab: TopicTab;
  topicItemLabel: string | null;
  onZurueck: () => void;
}) {
  const istHauptseite = HAUPTSEITEN.includes(view);
  const titel = topicItemLabel
    ?? (topicTab === 'zusammenfassung' ? 'Zusammenfassung' : topicTab === 'uebungen' ? 'Übungen' : null)
    ?? TITEL[view]
    ?? 'Gradefruit';

  return (
    <header className={styles.kopf}>
      {!istHauptseite && (
        <button type="button" className={styles.zurueck} onClick={onZurueck} aria-label="Zurück">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <h1 className={styles.titel}>{titel}</h1>
    </header>
  );
}
