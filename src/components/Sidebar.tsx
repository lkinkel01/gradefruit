'use client';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { BrandMark } from './BrandMark';
import { GrapefruitProgress } from './Logo';
import { CheckIcon, LockIcon, OverviewIcon, ReviewIcon, TutorIcon } from './UiIcons';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  topicTab: 'zusammenfassung' | 'uebungen';
  owned: boolean;
  ownedLk: boolean;
  level: 'gk' | 'lk';
  onNavigate: (v: View) => void;
  onOpenCheckout: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Übersicht',
    icon: <OverviewIcon />,
  },
  {
    id: 'review', label: 'Wiederholen',
    icon: <ReviewIcon />,
  },
  {
    id: 'tutors', label: '1:1 Nachhilfe',
    icon: <TutorIcon />,
  },
];

// Sprungziel fürs Themen-Untermenü: gewünschten Tab einmalig merken
// (TopicView liest und löscht den Schlüssel beim Öffnen bzw. beim navSignal).
function rememberTab(tab: 'zusammenfassung' | 'uebungen') {
  try { localStorage.setItem('gf-open-tab', tab); } catch { /* Speicher gesperrt */ }
}

export default function Sidebar({ view, topicTab, owned, ownedLk, level, onNavigate, onOpenCheckout }: Props) {
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
          flesh="var(--side-2)"
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
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(t.id)}
              >
                <span className={styles.cdot} style={{ background: t.color }} />
                <span className={styles.ti}>{t.label}</span>
                {topicTotal(t.id) > 0 && topicDone(t.id) === topicTotal(t.id)
                  ? <span className={styles.stDone}><CheckIcon size={11} /></span>
                  : t.id !== 'analysis' && !owned && !ownedLk && <span className={styles.stLock}><LockIcon size={13} /></span>
                }
              </button>
              {/* Untermenü: im aktiven Thema dauerhaft offen, sonst bei Hover.
                  Der aktive Tab wird markiert (Punkt + Gewicht, nicht nur Farbe). */}
              <div className={`${styles.flyout} ${active ? styles.flyoutPinned : ''}`}>
                {(['zusammenfassung', 'uebungen'] as const).map(tabId => {
                  const tabActive = active && topicTab === tabId;
                  return (
                    <button
                      key={tabId}
                      className={`${styles.flyItem} ${tabActive ? styles.flyOn : ''}`}
                      aria-current={tabActive ? 'page' : undefined}
                      onClick={() => { rememberTab(tabId); onNavigate(t.id); }}
                    >
                      {tabId === 'zusammenfassung' ? 'Zusammenfassung' : 'Übungen'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={`${styles.navsec} ${styles.navsecGap}`}>Navigation</div>
      <nav className={styles.snav}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={view === item.id ? styles.on : ''} aria-current={view === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
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
