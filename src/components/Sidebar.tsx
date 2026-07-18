'use client';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { SUMMARIES } from '@/lib/summaries';
import { BrandMark } from './BrandMark';
import { GrapefruitProgress } from './Logo';
import { CheckIcon, LockIcon, OverviewIcon, ReviewIcon, TutorIcon } from './UiIcons';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  topicTab: 'zusammenfassung' | 'uebungen';
  topicSection: string | null;
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

function rememberSummary(title: string) {
  try {
    localStorage.setItem('gf-open-tab', 'zusammenfassung');
    localStorage.setItem('gf-open-summary', title);
  } catch { /* Speicher gesperrt */ }
}

export default function Sidebar({ view, topicTab, topicSection, owned, ownedLk, level, onNavigate, onOpenCheckout }: Props) {
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <aside className={styles.sidebar}>
      <button className={styles.brand} onClick={() => onNavigate('dashboard')} aria-label="Zur Übersicht">
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
          const sections = SUMMARIES[t.id as 'analysis' | 'linalg' | 'stochastik'][level].sections;
          const summaryActive = active && topicTab === 'zusammenfassung';
          const exercisesActive = active && topicTab === 'uebungen';
          return (
            <div key={t.id} className={styles.topicWrap}>
              <button
                className={active ? styles.on : ''}
                aria-expanded={active}
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
                <button
                  className={`${styles.flyItem} ${summaryActive && !topicSection ? styles.flyOn : ''} ${summaryActive && topicSection ? styles.flyParentOn : ''}`}
                  aria-current={summaryActive && !topicSection ? 'page' : undefined}
                  onClick={() => { rememberTab('zusammenfassung'); onNavigate(t.id); }}
                >
                  Zusammenfassung
                </button>
                {summaryActive && (
                  <div className={styles.sectionList} aria-label={`Themen in ${t.label}`}>
                    {sections.map(section => {
                      const sectionActive = topicSection === section.title;
                      return (
                        <button
                          key={section.title}
                          className={`${styles.sectionItem} ${sectionActive ? styles.sectionOn : ''}`}
                          aria-current={sectionActive ? 'page' : undefined}
                          onClick={() => { rememberSummary(section.title); onNavigate(t.id); }}
                        >
                          {section.title}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  className={`${styles.flyItem} ${exercisesActive ? styles.flyOn : ''}`}
                  aria-current={exercisesActive ? 'page' : undefined}
                  onClick={() => { rememberTab('uebungen'); onNavigate(t.id); }}
                >
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
