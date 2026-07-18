'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { View, TOPICS, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { EXAM_DATE, EXAM_DATE_IS_PRELIMINARY, daysUntilExam } from '@/lib/exam';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon, CalendarIcon, ReelIcon } from './UiIcons';
import styles from './Dashboard.module.css';

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

  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDaysLeft(daysUntilExam()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.trim().split(' ')[0];

  const openReview = (status: Exclude<LernStatus, 'none'>) => {
    try { localStorage.setItem('gf-review-status', status); } catch { /* Speicher gesperrt */ }
    onNavigate('review');
  };
  const openReels = () => {
    try {
      localStorage.removeItem('gf-feed-topic');
      sessionStorage.setItem('gf-feed-return', `${window.location.pathname}${window.location.search}${window.location.hash}`);
    } catch { /* Speicher gesperrt */ }
    router.push('/feed');
  };

  const statusTiles: { status: Exclude<LernStatus, 'none'>; label: string; num: number }[] = [
    { status: 'verstanden', label: 'Verstanden', num: statusCounts.verstanden },
    { status: 'wiederholen', label: 'Wiederholen', num: statusCounts.wiederholen },
    { status: 'unklar', label: 'Nicht verstanden', num: statusCounts.unklar },
  ];

  return (
    <div className={`${styles.page} gf-stagger`}>
      {/* Kopf: Begrüßung + Kurswahl — bewusst ruhig, ohne Zusatzsatz */}
      <div className={styles.head}>
        <h1 className={styles.greet}>Guten Tag{firstName ? `, ${firstName}` : ''}.</h1>
        {choosable ? (
          <div className={styles.courseSeg} role="tablist" aria-label="Kursniveau wählen">
            <button role="tab" aria-selected={level === 'gk'} className={`${styles.courseBtn} ${level === 'gk' ? styles.courseOn : ''}`} onClick={() => onChooseLevel('gk')}>Grundkurs</button>
            <button role="tab" aria-selected={level === 'lk'} className={`${styles.courseBtn} ${level === 'lk' ? styles.courseOn : ''}`} onClick={() => onChooseLevel('lk')}>Leistungskurs</button>
          </div>
        ) : (
          <span className={styles.courseBadge}>{level === 'lk' ? 'Leistungskurs' : 'Grundkurs'}</span>
        )}
      </div>

      {/* Prüfungstermin — ruhige Info-Zeile, kein dominanter Anker mehr */}
      <div className={styles.countdown}>
        <p className={styles.cdLine}>
          <span className={styles.cdIcon} aria-hidden="true"><CalendarIcon size={18} /></span>
          <span className={styles.cdDays}>{daysLeft ?? '—'}</span>
          <span className={styles.cdLabel}>Tage bis zur Prüfung</span>
        </p>
        <p className={styles.cdMeta}>
          <span className={styles.cdTitle}>Schriftliche Abschlussprüfung Mathematik · Hessen</span>
          <span className={styles.cdDate}>
            {EXAM_DATE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            {EXAM_DATE_IS_PRELIMINARY && ' · voraussichtlich'}
          </span>
        </p>
      </div>

      {/* Fortschritt und Lernstand — eine zusammengehörige, klickbare Einheit.
          Der Kopf öffnet die Wiederholen-Seite (die bestehende Detailansicht
          des Lernstands); die drei Stufen springen mit vorgewähltem Filter. */}
      <section className={styles.statusSec} aria-label="Fortschritt und Lernstand">
        <button type="button" className={styles.progressCard} onClick={() => onNavigate('review')}>
          <GrapefruitProgress pct={pct} size={88} />
          <span className={styles.progressBody}>
            <span className={styles.progressTitle}>Fortschritt und Lernstand</span>
            <span className={styles.progressPct}>
              <span className={styles.pctNum}>{pct}</span>
              <span className={styles.pctUnit}>%</span>
            </span>
            <span className={styles.progressSub}>{totalDone} von {totalLessons} Aufgaben verstanden</span>
          </span>
          <span className={styles.progressGo} aria-hidden="true"><ArrowRightIcon size={16} /></span>
        </button>
        <div className={styles.statRow}>
          {statusTiles.map(t => (
            <button key={t.status} type="button" className={styles.stat} onClick={() => openReview(t.status)}>
              <span className={styles.statNum}>{t.num}</span>
              <span className={styles.statLabel}>{t.label}</span>
              <span className={styles.statGo}><ArrowRightIcon size={14} /></span>
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button className="btn primary" onClick={() => onNavigate('analysis')}>Weiterlernen</button>
          <button className="btn light" onClick={openReels}>
            <ReelIcon size={14} />
            Reel-Modus
          </button>
        </div>
      </section>

      {/* Themen — editoriale Liste */}
      <p className={`gf-meta ${styles.secLabel}`}>Themen</p>
      <div className={styles.list}>
        {TOPICS.map(t => {
          const tp = topicTotal(t.id) > 0 ? Math.round((topicDone(t.id) / topicTotal(t.id)) * 100) : 0;
          return (
            <button key={t.id} className={styles.topicRow} onClick={() => onNavigate(t.id)}>
              <GrapefruitProgress pct={tp} size={40} />
              <span className={styles.topicName}>{t.label}</span>
              <span className={styles.topicCount}>{topicDone(t.id)}/{topicTotal(t.id)} verstanden</span>
              <span className={styles.topicGo}><ArrowRightIcon size={16} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
