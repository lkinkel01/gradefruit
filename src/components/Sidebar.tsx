'use client';
import { useEffect, useRef, useState } from 'react';
import { NavigateTo, TopicTab, View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { SUMMARIES } from '@/lib/summaries';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { LINALG_TASKS } from '@/lib/linalgTasks';
import { STOCHASTIK_TASKS } from '@/lib/stochastikTasks';
import { ANALYSIS_LK_TASKS } from '@/lib/analysisLkTasks';
import { LINALG_LK_TASKS } from '@/lib/linalgLkTasks';
import { STOCHASTIK_LK_TASKS } from '@/lib/stochastikLkTasks';
import { BrandMark } from './BrandMark';
import { CheckIcon, ChevronIcon, CoursesIcon, LockIcon, OverviewIcon, ReviewIcon, TutorIcon } from './UiIcons';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  topicTab: TopicTab;
  topicItemId: string | null;
  owned: boolean;
  ownedLk: boolean;
  level: 'gk' | 'lk';
  levelChoosable: boolean;
  onChooseLevel: (l: 'gk' | 'lk') => void;
  onNavigate: NavigateTo;
  onOpenCheckout: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Dashboard',
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

const TASKS_BY_TOPIC = {
  analysis: { gk: ANALYSIS_TASKS, lk: ANALYSIS_LK_TASKS },
  linalg: { gk: LINALG_TASKS, lk: LINALG_LK_TASKS },
  stochastik: { gk: STOCHASTIK_TASKS, lk: STOCHASTIK_LK_TASKS },
};

export default function Sidebar({ view, topicTab, topicItemId, owned, ownedLk, level, levelChoosable, onChooseLevel, onNavigate, onOpenCheckout }: Props) {
  const { topicDone, topicTotal } = useProgress();

  // Eingeklappte Themen: Ein Klick auf das bereits aktive Thema klappt sein
  // Untermenü zu (und wieder auf), ohne zu navigieren.
  const [collapsedTopics, setCollapsedTopics] = useState<Set<View>>(new Set());
  // Eingeklappte Unterlisten (Zusammenfassung/Übungen), Schlüssel „id:tab".
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(new Set());
  const toggleSub = (key: string) => setCollapsedSubs(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  // Hover öffnet Untermenüs erst, wenn die Maus einen Moment liegen bleibt
  // (280 ms) — lang genug, dass beim Vorbeifahren nichts versehentlich
  // aufklappt, kurz genug, dass es sich nicht zäh anfühlt.
  const HOVER_DELAY = 280;
  const [hoverTopic, setHoverTopic] = useState<View | null>(null);
  const hoverTimer = useRef<number | null>(null);
  // Dieselbe Logik eine Ebene tiefer: Zusammenfassung/Übungen klappen ihre
  // Unterpunkte auch beim Verweilen auf. Schlüssel „id:tab".
  const [hoverSub, setHoverSub] = useState<string | null>(null);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const subTimer = useRef<number | null>(null);

  const enterTopic = (id: View) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHoverTopic(id), HOVER_DELAY);
  };
  const leaveTopic = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    setHoverTopic(null);
  };
  const enterSub = (key: string) => {
    if (subTimer.current) window.clearTimeout(subTimer.current);
    subTimer.current = window.setTimeout(() => setHoverSub(key), HOVER_DELAY);
  };
  const leaveSub = () => {
    if (subTimer.current) window.clearTimeout(subTimer.current);
    subTimer.current = null;
    setHoverSub(null);
  };
  useEffect(() => () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (subTimer.current) window.clearTimeout(subTimer.current);
  }, []);

  const toggleCollapse = (id: View) => {
    setCollapsedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className={styles.sidebar}>
      <button className={styles.brand} onClick={() => onNavigate('landing')} aria-label="Zur Startseite">
        <BrandMark size={24} />
        Gradefruit
      </button>

      <div className={styles.navsec}>Themen</div>
      <nav className={styles.snav}>
        {TOPICS.map(t => {
          const active = view === t.id;
          const topicId = t.id as 'analysis' | 'linalg' | 'stochastik';
          const sections = SUMMARIES[topicId][level].sections;
          const tasks = TASKS_BY_TOPIC[topicId][level];
          const summaryActive = active && topicTab === 'zusammenfassung';
          const exercisesActive = active && topicTab === 'uebungen';
          const expanded = (active && !collapsedTopics.has(t.id)) || hoverTopic === t.id;
          // Unterpunkte sind offen, wenn ihr Bereich aktiv (und nicht manuell
          // zugeklappt) ist ODER die Maus einen Moment darauf liegt.
          const summaryOpen = (summaryActive && (!!topicItemId || !collapsedSubs.has(`${t.id}:zusammenfassung`)))
            || hoverSub === `${t.id}:zusammenfassung`;
          const exercisesOpen = (exercisesActive && (!!topicItemId || !collapsedSubs.has(`${t.id}:uebungen`)))
            || hoverSub === `${t.id}:uebungen`;
          return (
            <div
              key={t.id}
              className={styles.topicWrap}
              onMouseEnter={() => enterTopic(t.id)}
              onMouseLeave={leaveTopic}
            >
              <button
                className={active ? styles.on : ''}
                aria-expanded={expanded}
                onClick={() => {
                  if (active) {
                    // Aktives Thema: alles einklappen und auf die Themenseite —
                    // dort wird zwischen Zusammenfassung und Übungen gewählt.
                    setCollapsedTopics(prev => new Set(prev).add(t.id));
                    setCollapsedSubs(prev => {
                      const next = new Set(prev);
                      next.add(`${t.id}:zusammenfassung`);
                      next.add(`${t.id}:uebungen`);
                      return next;
                    });
                    if (hoverTimer.current) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; }
                    setHoverTopic(null);
                    if (subTimer.current) { window.clearTimeout(subTimer.current); subTimer.current = null; }
                    setHoverSub(null);
                    onNavigate(t.id, { tab: 'uebersicht', itemId: null });
                  } else {
                    setCollapsedTopics(prev => {
                      const next = new Set(prev);
                      next.delete(t.id);
                      return next;
                    });
                    onNavigate(t.id, { tab: 'uebersicht', itemId: null });
                  }
                }}
              >
                <span className={styles.cdot} style={{ background: t.color }} />
                <span className={styles.ti}>{t.label}</span>
                {topicTotal(t.id) > 0 && topicDone(t.id) === topicTotal(t.id)
                  ? <span className={styles.stDone}><CheckIcon size={11} /></span>
                  : t.id !== 'analysis' && !owned && !ownedLk && <span className={styles.stLock}><LockIcon size={13} /></span>
                }
              </button>
              {/* Untermenü: im aktiven Thema offen (einklappbar per Klick auf
                  das Thema), sonst nach kurzem Hover-Moment. */}
              <div className={`${styles.flyout} ${expanded ? styles.flyoutPinned : ''}`}>
                <div
                  onMouseEnter={() => enterSub(`${t.id}:zusammenfassung`)}
                  onMouseLeave={leaveSub}
                >
                <button
                  className={`${styles.flyItem} ${summaryActive && !topicItemId ? styles.flyOn : ''} ${summaryActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={summaryActive && !topicItemId ? 'page' : undefined}
                  aria-expanded={summaryOpen}
                  onClick={() => {
                    // Steht ein einzelner Abschnitt offen, führt der Klick zurück
                    // zur vollständigen Liste — sonst klappt er nur ein/aus.
                    if (summaryActive && !topicItemId) toggleSub(`${t.id}:zusammenfassung`);
                    else onNavigate(t.id, { tab: 'zusammenfassung', itemId: null });
                  }}
                >
                  Zusammenfassung
                </button>
                {summaryOpen && (
                  <div className={styles.sectionList} aria-label={`Themen in ${t.label}`}>
                    {sections.map(section => {
                      const sectionActive = topicItemId === section.title;
                      return (
                        <button
                          key={section.title}
                          className={`${styles.sectionItem} ${sectionActive ? styles.sectionOn : ''}`}
                          aria-current={sectionActive ? 'page' : undefined}
                          onClick={() => onNavigate(t.id, {
                            tab: 'zusammenfassung',
                            itemId: section.title,
                            itemLabel: section.title,
                          })}
                        >
                          {section.title}
                        </button>
                      );
                    })}
                  </div>
                )}
                </div>
                <div
                  onMouseEnter={() => enterSub(`${t.id}:uebungen`)}
                  onMouseLeave={leaveSub}
                >
                <button
                  className={`${styles.flyItem} ${exercisesActive && !topicItemId ? styles.flyOn : ''} ${exercisesActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={exercisesActive && !topicItemId ? 'page' : undefined}
                  aria-expanded={exercisesOpen}
                  onClick={() => {
                    if (exercisesActive && !topicItemId) toggleSub(`${t.id}:uebungen`);
                    else onNavigate(t.id, { tab: 'uebungen', itemId: null });
                  }}
                >
                  Übungen
                </button>
                {exercisesOpen && (
                  <div className={styles.sectionList} aria-label={`Übungen in ${t.label}`}>
                    {tasks.map((task, taskIndex) => {
                      const taskActive = topicItemId === task.id;
                      const taskLabel = `${taskIndex + 1}. ${task.tag}`;
                      return (
                        <button
                          key={task.id}
                          className={`${styles.sectionItem} ${taskActive ? styles.sectionOn : ''}`}
                          aria-current={taskActive ? 'page' : undefined}
                          onClick={() => onNavigate(t.id, {
                            tab: 'uebungen',
                            itemId: task.id,
                            itemLabel: task.tag,
                          })}
                        >
                          {taskLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
                </div>
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
        {/* „Meine Kurse" klappt die gekauften Kurse aus; der aktuelle ist
            markiert. Erscheint nur, wenn es wirklich mehr als einen gibt. */}
        {levelChoosable && (
          <>
            <button
              className={styles.courseSwap}
              aria-expanded={coursesOpen}
              onClick={() => setCoursesOpen(open => !open)}
            >
              <span className={styles.icon}><CoursesIcon /></span>
              <span className={styles.ti}>Meine Kurse</span>
              <span className={`${styles.courseChev} ${coursesOpen ? styles.courseChevOpen : ''}`} aria-hidden="true">
                <ChevronIcon direction="down" size={14} />
              </span>
            </button>
            {coursesOpen && (
              <div className={styles.courseList}>
                {([
                  { id: 'gk' as const, label: 'Grundkurs' },
                  { id: 'lk' as const, label: 'Leistungskurs' },
                ]).map(course => (
                  <button
                    key={course.id}
                    className={`${styles.courseItem} ${level === course.id ? styles.courseItemOn : ''}`}
                    aria-current={level === course.id ? 'true' : undefined}
                    onClick={() => onChooseLevel(course.id)}
                  >
                    {course.label}
                    {level === course.id && (
                      <span className={styles.courseTick} aria-hidden="true"><CheckIcon size={11} /></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
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
