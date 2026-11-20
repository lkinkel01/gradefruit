'use client';
import { useState } from 'react';
import { PROBE_ABSCHNITTE, PROBE_AUFGABEN } from '@/lib/probe';
import { NavigateTo, TopicTab, View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { indexFor } from '@/lib/contentIndex';
import { useImAppRahmen } from '@/lib/nativeApp';
import { BrandMark } from './BrandMark';
import { CheckIcon, ChevronIcon, CoursesIcon, OverviewIcon, ReelIcon, ReviewIcon } from './UiIcons';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  topicTab: TopicTab;
  topicItemId: string | null;
  owned: boolean;
  ownedLk: boolean;
  level: 'gk' | 'lk';
  onChooseLevel: (l: 'gk' | 'lk') => void;
  onNavigate: NavigateTo;
  onOpenCheckout: () => void;
  /** Reel-Modus liegt auf einer eigenen Route, deshalb kein View-Wechsel. */
  onReels: () => void;
  /** Klappt die Leiste nach links weg. */
  onEinklappen: () => void;
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
];


export default function Sidebar({ view, topicTab, topicItemId, owned, ownedLk, level, onChooseLevel, onNavigate, onOpenCheckout, onReels, onEinklappen }: Props) {
  const { topicDone, topicTotal } = useProgress();
  // In der App darf nirgends zum Kauf aufgefordert werden — Apples Regel für
  // Apps ohne eigenen In-App-Kauf. Im Browser bleibt alles wie bisher.
  const imApp = useImAppRahmen();

  // Eingeklappte Themen: Ein Klick auf das bereits aktive Thema klappt sein
  // Untermenü zu (und wieder auf), ohne zu navigieren.
  //
  // Beim Einstieg sind ALLE Themen zu. Vorher sprang die Liste beim Öffnen
  // des Kurses sofort auf und zeigte Zusammenfassung und Übungen — wer
  // hereinkommt, sieht dann als Erstes eine lange Liste statt des Themas.
  const [collapsedTopics, setCollapsedTopics] = useState<Set<View>>(
    () => new Set(TOPICS.map(t => t.id)),
  );
  // Eingeklappte Unterlisten (Zusammenfassung/Übungen), Schlüssel „id:tab".
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(
    () => new Set(TOPICS.flatMap(t => [`${t.id}:zusammenfassung`, `${t.id}:uebungen`])),
  );
  // Ein Thema auf- oder zuklappen.
  const toggleCollapse = (id: View) => {
    setCollapsedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Dasselbe eine Ebene tiefer.
  const toggleSub = (key: string) => {
    setCollapsedSubs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  /* Aufgeklappt wird ausschließlich per Klick.

     Vorher öffnete sich ein Untermenü, wenn die Maus 280 ms darauf liegen
     blieb, und schloss sich beim Wegfahren wieder. Zwei Dinge gingen damit
     schief: Ein Klick auf ein Thema öffnete nichts (man musste erst warten,
     ohne zu klicken), und was man aufhatte, verschwand, sobald man mit der
     Maus wegging — auch mitten im Lesen der Liste. Jetzt gilt die einfache
     Regel: Klick auf, Klick zu, dazwischen bleibt es stehen.

     Damit fallen Hover-Zustand und beide Zeitgeber ersatzlos weg. */
  const [coursesOpen, setCoursesOpen] = useState(false);

  /* Sieht dieser Nutzer gerade nur den kostenlosen Anfang? Der Kauf gilt je
     Kursstufe, also entscheidet die Stufe, die gerade gelernt wird. */
  const inProbe = level === 'gk' ? !owned : !ownedLk;

  // Nur die tatsächlich freigeschalteten Kurse.
  const meineKurse = ([
    { id: 'gk' as const, label: 'Grundkurs', hat: owned },
    { id: 'lk' as const, label: 'Leistungskurs', hat: ownedLk },
  ]).filter(k => k.hat);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.kopfZeile}>
        <button className={styles.brand} onClick={() => onNavigate('landing')} aria-label="Zur Startseite">
          <BrandMark size={24} />
          Gradefruit
        </button>
        {/* Wer lange an einer Aufgabe sitzt, will die Fläche. Die Leiste lässt
            sich wegschieben und kommt über den Knopf am Rand zurück. */}
        <button
          type="button"
          className={styles.einklappen}
          onClick={onEinklappen}
          aria-label="Menü einklappen"
          title="Menü einklappen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className={styles.navsec}>Themen</div>
      <nav className={styles.snav}>
        {TOPICS.map(t => {
          const active = view === t.id;
          const topicId = t.id as 'analysis' | 'linalg' | 'stochastik';
          /* Nur das Inhaltsverzeichnis — die Inhalte selbst kommen vom Server.

             Ohne Kauf wird die Gliederung auf den kostenlosen Anfang gekürzt.
             Vorher bot die Leiste alle sieben Abschnitte an, während in der
             Liste daneben drei standen: Die übrigen vier führten ins Leere. */
          const alles = indexFor(topicId, level);
          const sections = inProbe ? alles.sections.slice(0, PROBE_ABSCHNITTE) : alles.sections;
          const tasks = inProbe ? alles.tasks.slice(0, PROBE_AUFGABEN) : alles.tasks;
          const summaryActive = active && topicTab === 'zusammenfassung';
          const exercisesActive = active && topicTab === 'uebungen';
          const expanded = !collapsedTopics.has(t.id);
          /* Ein Unterpunkt ist offen, solange er nicht zugeklappt wurde. Nicht
             mehr an „ist gerade aktiv" gebunden: Wer Übungen aufklappt und
             danach in die Zusammenfassung wechselt, soll die Übungen weiter
             aufgeklappt vorfinden. */
          const summaryOpen = !collapsedSubs.has(`${t.id}:zusammenfassung`);
          const exercisesOpen = !collapsedSubs.has(`${t.id}:uebungen`);
          return (
            <div key={t.id} className={styles.topicWrap}>
              <button
                className={active ? styles.on : ''}
                aria-expanded={expanded}
                onClick={() => {
                  /* Ein Klick klappt auf oder zu und führt ins Thema. Beim
                     Zuklappen bleiben die Unterpunkte so, wie sie waren —
                     wer sie beim nächsten Aufklappen wieder offen vorfindet,
                     muss sich nicht jedes Mal neu durchhangeln. */
                  toggleCollapse(t.id);
                  onNavigate(t.id, { tab: 'uebersicht', itemId: null });
                }}
              >
                <span className={styles.cdot} style={{ background: t.color }} />
                <span className={styles.ti}>{t.label}</span>
                {/* Kein Schloss mehr. Es stammte aus der Zeit, als außer
                    Analysis alles gesperrt war. Seit es in jedem Thema einen
                    kostenlosen Anfang gibt, ist es schlicht falsch: Es sagt
                    „hier kommst du nicht rein", und man kommt rein. */}
                {topicTotal(t.id, level) > 0 && topicDone(t.id, level) === topicTotal(t.id, level) && (
                  <span className={styles.stDone}><CheckIcon size={11} /></span>
                )}
              </button>
              {/* Untermenü: im aktiven Thema offen (einklappbar per Klick auf
                  das Thema), sonst nach kurzem Hover-Moment. */}
              <div className={`${styles.flyout} ${expanded ? styles.flyoutPinned : ''}`}>
                <div>
                <button
                  className={`${styles.flyItem} ${summaryActive && !topicItemId ? styles.flyOn : ''} ${summaryActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={summaryActive && !topicItemId ? 'page' : undefined}
                  aria-expanded={summaryOpen}
                  onClick={() => {
                    toggleSub(`${t.id}:zusammenfassung`);
                    onNavigate(t.id, { tab: 'zusammenfassung', itemId: null });
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
                <div>
                <button
                  className={`${styles.flyItem} ${exercisesActive && !topicItemId ? styles.flyOn : ''} ${exercisesActive && topicItemId ? styles.flyParentOn : ''}`}
                  aria-current={exercisesActive && !topicItemId ? 'page' : undefined}
                  aria-expanded={exercisesOpen}
                  onClick={() => {
                    toggleSub(`${t.id}:uebungen`);
                    onNavigate(t.id, { tab: 'uebungen', itemId: null });
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
        {/* Reel-Modus gehört in die Navigation: Wiederholen im Swipe-Format ist
            eine eigene Art zu lernen, kein Untermenü. Liegt auf einer eigenen
            Route, deshalb ein eigener Aufruf statt eines View-Wechsels. */}
        <button onClick={onReels}>
          <span className={styles.icon}><ReelIcon /></span>
          <span className={styles.ti}>Reel-Modus</span>
        </button>

        {/* „Meine Kurse" zeigt nur, was man wirklich hat.
            Vorher erschien der Punkt auch für Gäste und listete beide Kurse —
            also überwiegend Dinge, die einem nicht gehören. Wer keinen Kurs
            hat, sieht ihn gar nicht; wer einen hat, sieht diesen einen; wer
            beide hat, kann wechseln. Was es sonst noch gibt, steht unter
            „Weitere Kurse" — eine Preisliste gehört nicht in die Navigation. */}
        {meineKurse.length > 0 && (
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
                {meineKurse.map(course => (
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

      {/* Unten links genau ein Knopf, passend zum Kaufstand — und bewusst
          UNTER der Navigation, nicht darin: Es ist kein Ort, an den man
          navigiert, sondern eine Handlung.
          Kein Kurs → freischalten. Ein Kurs, aber es gibt noch einen →
          weitere Kurse. Beide gekauft → gar nichts, denn es gibt nichts
          mehr zu holen. */}
      {!imApp && (owned || ownedLk ? (
        !(owned && ownedLk) && (
          <div className={styles.unlockCard}>
            <button className="btn sm" onClick={() => onNavigate('kurse')}>
              Weitere Kurse
            </button>
          </div>
        )
      ) : (
        <div className={styles.unlockCard}>
          <button className="btn primary btn sm" onClick={onOpenCheckout}>
            Kurs freischalten
          </button>
        </div>
      ))}
    </aside>
  );
}
