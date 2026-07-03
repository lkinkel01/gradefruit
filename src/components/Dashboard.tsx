'use client';
import { useState, useEffect } from 'react';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import styles from './Dashboard.module.css';

interface Props {
  onNavigate: (v: View) => void;
  level: 'gk' | 'lk';
  choosable: boolean;
  onChooseLevel: (l: 'gk' | 'lk') => void;
}

export default function Dashboard({ onNavigate, level, choosable, onChooseLevel }: Props) {
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;
  const open = Math.max(0, totalLessons - totalDone);
  const kurs = level === 'lk' ? 'Leistungskurs' : 'Grundkurs';

  const [greeting, setGreeting] = useState('Hallo');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend');
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>{greeting}</h1>
      <p className={styles.pblurb}>Dein Mathe-Abi 2027 – Hessen {kurs}. Mach weiter, wo du aufgehört hast.</p>

      <div className={styles.courseRow}>
        <span className={styles.courseLabel}>Dein Kurs</span>
        {choosable ? (
          <div className={styles.courseSeg} role="tablist" aria-label="Kursniveau wählen">
            <button
              role="tab"
              aria-selected={level === 'gk'}
              className={`${styles.courseBtn} ${level === 'gk' ? styles.courseOn : ''}`}
              onClick={() => onChooseLevel('gk')}
            >
              Grundkurs
            </button>
            <button
              role="tab"
              aria-selected={level === 'lk'}
              className={`${styles.courseBtn} ${level === 'lk' ? styles.courseOn : ''}`}
              onClick={() => onChooseLevel('lk')}
            >
              Leistungskurs
            </button>
          </div>
        ) : (
          <span className={styles.courseBadge}>{kurs}</span>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNum}>{totalDone}</div>
          <div className={styles.statLabel}>Aufgaben erledigt</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{open}</div>
          <div className={styles.statLabel}>Noch offen</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{TOPICS.length}</div>
          <div className={styles.statLabel}>Themen</div>
        </div>
      </div>

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
                  <div className={styles.tbarRow}>
                    <div className={styles.tbarTrack}>
                      <div
                        className={styles.tbarFill}
                        style={{
                          width: `${topicTotal(t.id) > 0 ? Math.round((topicDone(t.id) / topicTotal(t.id)) * 100) : 0}%`,
                          background: t.color,
                        }}
                      />
                    </div>
                    <small>{topicDone(t.id)}/{topicTotal(t.id)}</small>
                  </div>
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
