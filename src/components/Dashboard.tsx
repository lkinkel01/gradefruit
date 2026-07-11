'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { View, TOPICS, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { GrapefruitProgress } from './Logo';
import styles from './Dashboard.module.css';

// Voraussichtlicher Termin der schriftlichen Prüfung. Sobald das Hessische
// Kultusministerium den offiziellen Termin veröffentlicht: hier eintragen
// und das „voraussichtlich" im Label unten entfernen.
const EXAM_DATE = new Date('2027-05-03T09:00:00');

// Wechselnde Begrüßungssätze, damit die Übersicht nicht jeden Tag gleich klingt.
const MOTIVATION = [
  'Weiter da, wo du aufgehört hast.',
  'Konstanz schlägt Kraftakt. Ein Stück pro Tag reicht.',
  'Jede eingeordnete Aufgabe bringt dich der Prüfung näher.',
  'Wiederhol zuerst, was unklar war. Der Rest kommt von selbst.',
  'Du musst nicht alles können. Nur heute etwas mehr als gestern.',
];

interface Props {
  onNavigate: (v: View) => void;
  level: 'gk' | 'lk';
  choosable: boolean;
  onChooseLevel: (l: 'gk' | 'lk') => void;
}

export default function Dashboard({ onNavigate, level, choosable, onChooseLevel }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { totalDone, totalLessons, topicDone, topicTotal, statusCounts } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  const [greeting, setGreeting] = useState('Hallo');
  const [motivation, setMotivation] = useState(MOTIVATION[0]);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    // Vor 12 Uhr ist Morgen/Vormittag – 11 Uhr ist also noch „Guten Morgen".
    setGreeting(h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend');
    // Satz wechselt mit Tag und Stunde, bleibt innerhalb einer Sitzung stabil.
    setMotivation(MOTIVATION[(now.getDate() + h) % MOTIVATION.length]);
    setDaysLeft(Math.max(0, Math.ceil((EXAM_DATE.getTime() - now.getTime()) / 86_400_000)));
  }, []);

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.trim().split(' ')[0];

  // Klick auf eine Status-Kachel: Wiederholen-Seite mit vorgewähltem Filter.
  const openReview = (status: Exclude<LernStatus, 'none'>) => {
    try { localStorage.setItem('gf-review-status', status); } catch { /* Speicher gesperrt */ }
    onNavigate('review');
  };

  const openReels = () => {
    try { localStorage.removeItem('gf-feed-topic'); } catch { /* Speicher gesperrt */ }
    router.push('/feed');
  };

  const statusTiles: { status: Exclude<LernStatus, 'none'>; label: string; num: number; hint: string }[] = [
    { status: 'verstanden', label: 'Verstanden', num: statusCounts.verstanden, hint: 'Sitzt. Kurz vor der Prüfung noch einmal ansehen.' },
    { status: 'wiederholen', label: 'Wiederholen', num: statusCounts.wiederholen, hint: 'Zum Wiederholen vorgemerkt.' },
    { status: 'unklar', label: 'Noch unklar', num: statusCounts.unklar, hint: 'Hier lohnt sich die nächste Lerneinheit.' },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>{greeting}{firstName ? `, ${firstName}` : ''}</h1>
      <p className={styles.pblurb}>{motivation}</p>

      <div className={styles.examCard}>
        <div className={styles.examDays}>
          <span className={styles.examNum}>{daysLeft ?? '–'}</span>
          <span className={styles.examLabel}>Tage bis zur Prüfung</span>
        </div>
        <div className={styles.examMeta}>
          <span className={styles.examTitle}>Schriftliche Abschlussprüfung Mathematik · Hessen</span>
          <span className={styles.examDate}>
            {EXAM_DATE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} · voraussichtlich
          </span>
        </div>
      </div>

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
          <span className={styles.courseBadge}>{level === 'lk' ? 'Leistungskurs' : 'Grundkurs'}</span>
        )}
      </div>

      {/* Lernstufen: anklickbar, führen zur Wiederholen-Seite mit Filter */}
      <div className={styles.stats}>
        {statusTiles.map(t => (
          <button key={t.status} className={styles.stat} onClick={() => openReview(t.status)} title={t.hint}>
            <div className={styles.statNum}>{t.num}</div>
            <div className={styles.statLabel}>{t.label}</div>
            <svg className={styles.statGo} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      <div className={styles.dgrid}>
        <div className={styles.dcard}>
          <h3>Dein Fortschritt</h3>
          <div className={styles.ringWrap}>
            <GrapefruitProgress pct={pct} size={84} />
            <div>
              <div className={styles.bigPct}>{pct} %</div>
              <div className={styles.sub}>{totalDone} von {totalLessons} Aufgaben verstanden</div>
            </div>
          </div>
          <div className={styles.contRow}>
            <button className="btn primary" onClick={() => onNavigate('analysis')}>
              Weiterlernen
            </button>
            <button className="btn light" onClick={openReels}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="3" /><polyline points="9.5 12.5 12 10 14.5 12.5" /><line x1="12" y1="10" x2="12" y2="15.5" /></svg>
              Reel-Modus
            </button>
          </div>
        </div>

        <div className={styles.dcard}>
          <h3>Themen</h3>
          <div className={styles.miniList}>
            {TOPICS.map(t => {
              const tp = topicTotal(t.id) > 0 ? Math.round((topicDone(t.id) / topicTotal(t.id)) * 100) : 0;
              return (
                <div key={t.id} className={styles.miniRow} onClick={() => onNavigate(t.id)}>
                  <GrapefruitProgress pct={tp} size={34} showLeaf={false} />
                  <div className={styles.tx}>
                    <b>{t.label}</b>
                    <small>{topicDone(t.id)}/{topicTotal(t.id)} Aufgaben verstanden</small>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
