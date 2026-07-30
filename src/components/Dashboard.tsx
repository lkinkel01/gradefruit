'use client';
import { useState, useEffect } from 'react';
import { View, TOPICS, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { EXAM_DATE, EXAM_DATE_IS_PRELIMINARY, daysUntilExam } from '@/lib/exam';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon, CalendarIcon } from './UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';
import styles from './Dashboard.module.css';

interface Props {
  onNavigate: (v: View) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { anzeigeName } = useAuth();
  // In der App trägt der Bildschirm nur diese eine Seite — dort darf der
  // Countdown die Fläche nehmen, die ihm laut DESIGN.md zusteht (Zahl als
  // Motiv, Haarlinien statt Karten). Im Browser bleibt alles wie bisher.
  const imApp = useImAppRahmen();
  const { totalDone, totalLessons, topicDone, topicTotal, statusCounts } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDaysLeft(daysUntilExam()));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Nur der erste Bestandteil: „Leon Kinkel" wird zu „Leon". Ist gar nichts
  // hinterlegt, bleibt die Begrüßung unpersönlich — aus einer E-Mail einen
  // Vornamen zu raten trifft oft daneben.
  const anrede = anzeigeName?.trim().split(/\s+/)[0];

  const openReview = (status: Exclude<LernStatus, 'none'>) => {
    try { localStorage.setItem('gf-review-status', status); } catch { /* Speicher gesperrt */ }
    onNavigate('review');
  };

  const statusTiles: { status: Exclude<LernStatus, 'none'>; label: string; num: number }[] = [
    { status: 'verstanden', label: 'Verstanden', num: statusCounts.verstanden },
    { status: 'wiederholen', label: 'Wiederholen', num: statusCounts.wiederholen },
    { status: 'unklar', label: 'Nicht verstanden', num: statusCounts.unklar },
  ];

  return (
    <div className={`${styles.page} ${imApp ? styles.app : ''} gf-stagger`}>
      {/* Kopf: nur die Begrüßung. Die Kursstufe wird in der Navigation
          umgeschaltet, nicht mehr hier. */}
      <div className={styles.head}>
        <h1 className={styles.greet}>Guten Tag{anrede ? `, ${anrede}` : ''}.</h1>
      </div>

      {/* Fortschritt und Lernstand — eine zusammengehörige, klickbare Einheit.
          Der Kopf öffnet die Wiederholen-Seite (die bestehende Detailansicht
          des Lernstands); die drei Stufen springen mit vorgewähltem Filter. */}
      <section className={styles.statusSec} aria-label="Fortschritt und Lernstand">
        {/* Eine Kachel, zwei Hälften: links der Countdown, rechts der Lernstand. */}
        <div className={styles.overviewCard}>
          <div className={styles.cdCol}>
            <span className={styles.cdIcon} aria-hidden="true"><CalendarIcon size={18} /></span>
            <span className={styles.cdDays}>{daysLeft ?? '—'}</span>
            <span className={styles.cdLabel}>Tage bis zur Prüfung</span>
            <span className={styles.cdDate}>
              {EXAM_DATE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
              {EXAM_DATE_IS_PRELIMINARY && ' · voraussichtlich'}
            </span>
          </div>
          <button type="button" className={styles.progressCol} onClick={() => onNavigate('review')}>
            <GrapefruitProgress pct={pct} size={72} />
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
        </div>
        <div className={styles.statRow}>
          {statusTiles.map(t => (
            <button key={t.status} type="button" className={styles.stat} onClick={() => openReview(t.status)}>
              <span className={styles.statNum}>{t.num}</span>
              <span className={styles.statLabel}>{t.label}</span>
              <span className={styles.statGo}><ArrowRightIcon size={14} /></span>
            </button>
          ))}
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
