'use client';
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
import { GrapefruitProgress } from './Logo';
import { CheckIcon, LockIcon, OverviewIcon, ReviewIcon, TutorIcon } from './UiIcons';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  topicTab: TopicTab;
  topicItemId: string | null;
  owned: boolean;
  ownedLk: boolean;
  level: 'gk' | 'lk';
  onNavigate: NavigateTo;
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

const TASKS_BY_TOPIC = {
  analysis: { gk: ANALYSIS_TASKS, lk: ANALYSIS_LK_TASKS },
  linalg: { gk: LINALG_TASKS, lk: LINALG_LK_TASKS },
  stochastik: { gk: STOCHASTIK_TASKS, lk: STOCHASTIK_LK_TASKS },
};

export default function Sidebar({ view, topicTab, topicItemId, owned, ownedLk, level, onNavigate, onOpenCheckout }: Props) {
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <aside className={styles.sidebar}>
      <button className={styles.brand} onClick={() => onNavigate('landing')} aria-label="Zur Startseite">
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
          const topicId = t.id as 'analysis' | 'linalg' | 'stochastik';
          const sections = SUMMARIES[topicId][level].sections;
          const tasks = TASKS_BY_TOPIC[topicId][level];
          const summaryActive = active && topicTab === 'zusammenfassung';
          const exercisesActive = active && topicTab === 'uebungen';
          return (
            <div key={t.id} className={styles.topicWrap}>
              <button
                className={active ? styles.on : ''}
                aria-expanded={active}
                onClick={() => onNavigate(t.id, { tab: 'zusammenfassung', itemId: null })}
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
                  className={`${styles.flyItem} ${summaryActive && !topicItemId ? styles.flyOn : ''} ${summaryActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={summaryActive && !topicItemId ? 'page' : undefined}
                  onClick={() => onNavigate(t.id, { tab: 'zusammenfassung', itemId: null })}
                >
                  Zusammenfassung
                </button>
                {summaryActive && (
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
                <button
                  className={`${styles.flyItem} ${exercisesActive && !topicItemId ? styles.flyOn : ''} ${exercisesActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={exercisesActive && !topicItemId ? 'page' : undefined}
                  onClick={() => onNavigate(t.id, { tab: 'uebungen', itemId: null })}
                >
                  Übungen
                </button>
                {exercisesActive && (
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
