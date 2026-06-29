'use client';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import styles from './Dashboard.module.css';

interface Props {
  onNavigate: (v: View) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>Hallo 👋</h1>
      <p className={styles.pblurb}>Dein Mathe-Abi 2027 – Hessen Grundkurs. Mach weiter, wo du aufgehört hast.</p>

      <div className={styles.dgrid}>
        <div className={styles.dcard}>
          <h3>Gesamtfortschritt</h3>
          <div className={styles.ringWrap}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle
                cx="36" cy="36" r="28" fill="none"
                stroke="var(--accent)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
            </svg>
            <div>
              <div className={styles.bigPct}>{pct}%</div>
              <div className={styles.sub}>{totalDone} von {totalLessons} Aufgaben</div>
            </div>
          </div>
          <button className={`btn primary ${styles.contBtn}`} onClick={() => onNavigate('analysis')}>
            Weiterlernen
          </button>
        </div>

        <div className={styles.dcard}>
          <h3>Themen</h3>
          <div className={styles.miniList}>
            {TOPICS.map(t => (
              <div key={t.id} className={styles.miniRow} onClick={() => onNavigate(t.id)}>
                <div className={styles.ic} style={{ background: t.color }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className={styles.tx}>
                  <b>{t.label}</b>
                  <small>{topicDone(t.id)}/{topicTotal(t.id)} Aufgaben</small>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
