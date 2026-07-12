'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { View, TOPICS, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { EXAM_DATE, EXAM_DATE_IS_PRELIMINARY, daysUntilExam } from '@/lib/exam';
import { GrapefruitProgress } from './Logo';
import styles from './Dashboard.module.css';

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
    setGreeting(h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend');
    setMotivation(MOTIVATION[(now.getDate() + h) % MOTIVATION.length]);
    setDaysLeft(daysUntilExam(now));
  }, []);

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.trim().split(' ')[0];

  const openReview = (status: Exclude<LernStatus, 'none'>) => {
    try { localStorage.setItem('gf-review-status', status); } catch { /* Speicher gesperrt */ }
    onNavigate('review');
  };
  const openReels = () => {
    try { localStorage.removeItem('gf-feed-topic'); } catch { /* Speicher gesperrt */ }
    router.push('/feed');
  };

  const statusTiles: { status: Exclude<LernStatus, 'none'>; label: string; num: number }[] = [
    { status: 'verstanden', label: 'Verstanden', num: statusCounts.verstanden },
    { status: 'wiederholen', label: 'Wiederholen', num: statusCounts.wiederholen },
    { status: 'unklar', label: 'Noch unklar', num: statusCounts.unklar },
  ];

  return (
    <div className={`${styles.page} gf-stagger`}>
      {/* Kopf: Begrüßung + Kurswahl */}
      <div className={styles.head}>
        <div>
          <h1 className={styles.greet}>{greeting}{firstName ? `, ${firstName}` : ''}.</h1>
          <p className={styles.blurb}>{motivation}</p>
        </div>
        {choosable ? (
          <div className={styles.courseSeg} role="tablist" aria-label="Kursniveau wählen">
            <button role="tab" aria-selected={level === 'gk'} className={`${styles.courseBtn} ${level === 'gk' ? styles.courseOn : ''}`} onClick={() => onChooseLevel('gk')}>Grundkurs</button>
            <button role="tab" aria-selected={level === 'lk'} className={`${styles.courseBtn} ${level === 'lk' ? styles.courseOn : ''}`} onClick={() => onChooseLevel('lk')}>Leistungskurs</button>
          </div>
        ) : (
          <span className={styles.courseBadge}>{level === 'lk' ? 'Leistungskurs' : 'Grundkurs'}</span>
        )}
      </div>

      {/* Countdown — der emotionale Anker, groß und editorial */}
      <div className={styles.countdown}>
        <div className={styles.cdNum}>
          <span className={`gf-index ${styles.cdDays}`}>{daysLeft ?? '—'}</span>
          <span className="gf-meta">Tage bis zur Prüfung</span>
        </div>
        <div className={styles.cdMeta}>
          <span className={styles.cdTitle}>Schriftliche Abschlussprüfung Mathematik · Hessen</span>
          <span className={styles.cdDate}>
            {EXAM_DATE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            {EXAM_DATE_IS_PRELIMINARY && ' · voraussichtlich'}
          </span>
        </div>
      </div>

      {/* Fortschritt — Grapefruit präsent */}
      <div className={styles.progress}>
        <GrapefruitProgress pct={pct} size={116} />
        <div className={styles.progressBody}>
          <p className="gf-meta">Dein Fortschritt</p>
          <div className={styles.progressPct}>
            <span className="gf-index">{pct}</span><span className={styles.progressUnit}>%</span>
          </div>
          <p className={styles.progressSub}>{totalDone} von {totalLessons} Aufgaben verstanden</p>
          <div className={styles.actions}>
            <button className="btn primary" onClick={() => onNavigate('analysis')}>Weiterlernen</button>
            <button className="btn light" onClick={openReels}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="3" /><polyline points="9.5 12.5 12 10 14.5 12.5" /><line x1="12" y1="10" x2="12" y2="15.5" /></svg>
              Reel-Modus
            </button>
          </div>
        </div>
      </div>

      {/* Lernstand — editoriale, klickbare Zahlen-Reihe */}
      <p className={`gf-meta ${styles.secLabel}`}>Dein Lernstand</p>
      <div className={styles.statRow}>
        {statusTiles.map(t => (
          <button key={t.status} className={styles.stat} onClick={() => openReview(t.status)}>
            <span className={`gf-index ${styles.statNum}`}>{t.num}</span>
            <span className={styles.statLabel}>{t.label}</span>
            <svg className={styles.statGo} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        ))}
      </div>

      {/* Themen — editoriale Liste */}
      <p className={`gf-meta ${styles.secLabel}`}>Themen</p>
      <div className={styles.list}>
        {TOPICS.map(t => {
          const tp = topicTotal(t.id) > 0 ? Math.round((topicDone(t.id) / topicTotal(t.id)) * 100) : 0;
          return (
            <button key={t.id} className={styles.topicRow} onClick={() => onNavigate(t.id)}>
              <GrapefruitProgress pct={tp} size={40} showLeaf={false} />
              <span className={styles.topicName}>{t.label}</span>
              <span className={styles.topicCount}>{topicDone(t.id)}/{topicTotal(t.id)} verstanden</span>
              <svg className={styles.topicGo} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
