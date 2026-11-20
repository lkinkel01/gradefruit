'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PREISE } from '@/lib/preise';
import styles from './KursWahl.module.css';

/**
 * Die erste Frage, die sich jede Schülerin in Hessen stellt: Grundkurs oder
 * Leistungskurs?
 *
 * Warum das im Startbereich steht und nicht erst auf der Kursseite: Die
 * Startseite sprach bisher alle gleichzeitig an und niemanden persönlich.
 * Zwei Knöpfe, auf denen „Grundkurs" und „Leistungskurs" steht, machen aus
 * einer allgemeinen Aussage eine Frage an genau den Menschen davor. Wer eine
 * Wahl trifft, ist bereits einen Schritt weiter als jemand, der nur liest.
 *
 * Die Wahl wird nicht nur weitergereicht, sondern auch gemerkt: `gf-level`
 * steuert, welche Kursstufe die Oberfläche später zeigt. Wer hier LK wählt,
 * sieht danach überall LK-Inhalte, ohne es ein zweites Mal einzustellen.
 */
const STUFEN = [
  { id: 'gk' as const, label: 'Grundkurs', kurz: 'GK' },
  { id: 'lk' as const, label: 'Leistungskurs', kurz: 'LK' },
];

export default function KursWahl({ onEnter }: { onEnter: () => void }) {
  const [gewaehlt, setGewaehlt] = useState<'gk' | 'lk' | null>(null);
  const router = useRouter();

  const waehlen = (id: 'gk' | 'lk') => {
    setGewaehlt(id);
    try {
      localStorage.setItem('gf-level', id);
    } catch {
      /* Speicher gesperrt: Die Wahl gilt dann nur für diesen Klick. */
    }
  };

  return (
    <div className={styles.wahl}>
      <p className={styles.frage} id="kurswahl-frage">Welchen Kurs schreibst du?</p>

      <div className={styles.knoepfe} role="group" aria-labelledby="kurswahl-frage">
        {STUFEN.map(s => (
          <button
            key={s.id}
            type="button"
            className={gewaehlt === s.id ? styles.stufeAn : styles.stufe}
            aria-pressed={gewaehlt === s.id}
            onClick={() => waehlen(s.id)}
          >
            <span className={styles.stufeName}>{s.label}</span>
            <span className={styles.stufePreis}>{PREISE[s.id].einmalig} einmalig</span>
          </button>
        ))}
      </div>

      <div className={styles.weiter}>
        <button type="button" className={styles.start} onClick={onEnter}>
          Kostenlos testen
        </button>
        {/* Erst nach einer Wahl: Vorher wüsste der Knopf nicht, wohin. */}
        {gewaehlt && (
          <button
            type="button"
            className={styles.zweit}
            onClick={() => router.push('/kurse')}
          >
            {STUFEN.find(s => s.id === gewaehlt)?.label} ansehen
          </button>
        )}
      </div>

      <p className={styles.fuss}>Ohne Zahlungsdaten. Die ersten Inhalte jedes Themas sind frei.</p>
    </div>
  );
}
