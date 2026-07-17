'use client';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { BrandMark } from './BrandMark';
import { GrapefruitProgress } from './Logo';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  owned: boolean;
  ownedLk: boolean;
  level: 'gk' | 'lk';
  onNavigate: (v: View) => void;
  onOpenCheckout: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Übersicht',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  },
  {
    id: 'review', label: 'Wiederholen',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" /></svg>
  },
  {
    id: 'tutors', label: '1:1 Nachhilfe',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></svg>
  },
];

// Sprungziel fürs Themen-Untermenü: gewünschten Tab einmalig merken
// (TopicView liest und löscht den Schlüssel beim Öffnen bzw. beim navSignal).
function rememberTab(tab: 'zusammenfassung' | 'uebungen') {
  try { localStorage.setItem('gf-open-tab', tab); } catch { /* Speicher gesperrt */ }
}

export default function Sidebar({ view, owned, ownedLk, level, onNavigate, onOpenCheckout }: Props) {
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <aside className={styles.sidebar}>
      <button className={styles.brand} onClick={() => onNavigate('landing')} aria-label="Zur Gradefruit Startseite">
        <BrandMark size={24} />
        Gradefruit
      </button>

      <div className={styles.course}>
        <GrapefruitProgress
          pct={pct}
          size={38}
          rind="var(--side-3)"
          flesh="var(--side-3)"
          gap="var(--side-2)"
          showLeaf={false}
        />
        <div className={styles.courseTx}>
          <div className={styles.courseTitle}>{level === 'lk' ? 'Leistungskurs' : 'Grundkurs'}</div>
          <div className={styles.courseSub}>{pct} % · {totalDone}/{totalLessons} Aufgaben</div>
        </div>
      </div>

      <div className={styles.navsec}>Themen</div>
      <nav className={styles.snav}>
        {TOPICS.map(t => {
          const active = view === t.id;
          return (
            <div key={t.id} className={styles.topicWrap}>
              <button
                className={active ? styles.on : ''}
                onClick={() => onNavigate(t.id)}
              >
                <span className={styles.cdot} style={{ background: t.color }} />
                <span className={styles.ti}>{t.label}</span>
                {topicTotal(t.id) > 0 && topicDone(t.id) === topicTotal(t.id)
                  ? <span className={styles.stDone}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                  : t.id !== 'analysis' && !owned && !ownedLk && <span className={styles.stLock}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></span>
                }
              </button>
              {/* Untermenü: im aktiven Thema dauerhaft offen, sonst bei Hover */}
              <div className={`${styles.flyout} ${active ? styles.flyoutPinned : ''}`}>
                <button className={styles.flyItem} onClick={() => { rememberTab('zusammenfassung'); onNavigate(t.id); }}>
                  Zusammenfassung
                </button>
                <button className={styles.flyItem} onClick={() => { rememberTab('uebungen'); onNavigate(t.id); }}>
                  Übungen
                </button>
              </div>
            </div>
          );
        })}
      </nav>

      <div className={`${styles.navsec} ${styles.navsecGap}`}>Navigation</div>
      <nav className={styles.snav}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={view === item.id ? styles.on : ''} onClick={() => onNavigate(item.id)}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.ti}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.spacer} />

      {!(owned || ownedLk) && (
        <div className={styles.unlockCard}>
          <p>Alle Aufgaben, Lösungen und Erklärvideos – bis zur Prüfung.</p>
          <button className="btn primary btn sm" onClick={onOpenCheckout}>
            Kurs freischalten
          </button>
        </div>
      )}
    </aside>
  );
}
