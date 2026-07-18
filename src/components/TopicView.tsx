'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { View, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { GrapefruitProgress } from './Logo';
import styles from './TopicView.module.css';
import SceneModal from './SceneModal';
import { SCENES, Scene } from '@/lib/scenes';
import { SUMMARIES } from '@/lib/summaries';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { LINALG_TASKS } from '@/lib/linalgTasks';
import { STOCHASTIK_TASKS } from '@/lib/stochastikTasks';
import { ANALYSIS_LK_TASKS } from '@/lib/analysisLkTasks';
import { LINALG_LK_TASKS } from '@/lib/linalgLkTasks';
import { STOCHASTIK_LK_TASKS } from '@/lib/stochastikLkTasks';

interface Task {
  id: string;
  tag: string;
  q: string;
  src: string;
  steps: { label: string; math: string }[];
  result: string;
  locked: boolean;
  videoId?: string; // passendes Erklärvideo (Schlüssel aus scenes.ts)
  mistakes?: string[];
}

const TOPIC_DATA: Record<string, { label: string; color: string; badge: string; gk: Task[]; lk: Task[] }> = {
  analysis: {
    label: 'Analysis',
    color: '#F26B4A',
    badge: 'Pflichtbereich',
    gk: ANALYSIS_TASKS,
    lk: ANALYSIS_LK_TASKS,
  },
  linalg: {
    label: 'Lineare Algebra & Geometrie',
    color: '#F26B4A',
    badge: 'Wahlbereich',
    gk: LINALG_TASKS,
    lk: LINALG_LK_TASKS,
  },
  stochastik: {
    label: 'Stochastik',
    color: '#F26B4A',
    badge: 'Pflichtbereich',
    gk: STOCHASTIK_TASKS,
    lk: STOCHASTIK_LK_TASKS,
  },
};

interface Props {
  topicId: View;
  level: 'gk' | 'lk';
  owned: boolean;
  ownedLk: boolean;
  navSignal: number;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  onOpenAsk: (ctx: string, snippet: string) => void;
  onNavigate: (v: View) => void;
}

type Tab = 'zusammenfassung' | 'uebungen';

// Die drei Lernstufen in fester Reihenfolge (Fuß jeder Aufgabe).
const STATUS_BTNS: { status: Exclude<LernStatus, 'none'>; label: string }[] = [
  { status: 'verstanden', label: 'Verstanden' },
  { status: 'wiederholen', label: 'Wiederholen' },
  { status: 'unklar', label: 'Noch unklar' },
];

export default function TopicView({ topicId, level, owned, ownedLk, navSignal, onOpenCheckout, onOpenAsk, onNavigate }: Props) {
  const router = useRouter();
  const topic = TOPIC_DATA[topicId as string];
  const { user } = useAuth();
  const { statusOf, setStatus } = useProgress();
  const [tab, setTab] = useState<Tab>('zusammenfassung');
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [openSolutions, setOpenSolutions] = useState<Set<string>>(new Set());
  const [video, setVideo] = useState<Scene | null>(null);
  const isFree = topicId === 'analysis';

  const tasks = topic ? topic[level] : [];
  const doneCount = tasks.filter(t => statusOf(topicId, t.id) === 'verstanden').length;

  // Einstieg: Wer hier schon gelernt hat, landet direkt bei den Übungen,
  // neue Lernende bei der Zusammenfassung. Deep-Links (Sidebar-Untermenü,
  // Reel-Modus, Wiederholen-Seite) können Tab und Aufgabe vorgeben.
  // Das Ref merkt sich den konsumierten Wunsch pro Navigation (key), damit
  // Reacts doppelter Effekt-Lauf im Dev-Modus ihn nicht wieder verwirft.
  const consumed = useRef<{ key: string; tab: Tab | null; task: string | null }>({ key: '', tab: null, task: null });
  useEffect(() => {
    const done = tasks.filter(t => statusOf(topicId, t.id) === 'verstanden').length;
    const key = `${topicId}/${level}/${navSignal}`;
    let forcedTab: Tab | null = consumed.current.key === key ? consumed.current.tab : null;
    let forcedTask: string | null = consumed.current.key === key ? consumed.current.task : null;
    try {
      const t = localStorage.getItem('gf-open-tab');
      if (t === 'zusammenfassung' || t === 'uebungen') {
        forcedTab = t;
        localStorage.removeItem('gf-open-tab');
      }
      const ft = localStorage.getItem('gf-open-task');
      if (ft && tasks.some(x => x.id === ft)) {
        forcedTask = ft;
        forcedTab = 'uebungen';
        localStorage.removeItem('gf-open-task');
      }
      consumed.current = { key, tab: forcedTab, task: forcedTask };
    } catch { /* Speicher gesperrt */ }
    setTab(forcedTab ?? (done > 0 ? 'uebungen' : 'zusammenfassung'));
    const toOpen = forcedTask
      ? tasks.find(t => t.id === forcedTask)
      : tasks.find(t => statusOf(topicId, t.id) !== 'verstanden') ?? tasks[0];
    setOpenCards(toOpen ? new Set([toOpen.id]) : new Set());
    setOpenSolutions(new Set());
    if (forcedTask) {
      // Gewünschte Aufgabe nach dem Rendern in den Blick holen
      setTimeout(() => {
        document.getElementById(`task-${forcedTask}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, level, navSignal]);

  if (!topic) return null;

  const hasAccess = isFree || (level === 'gk' ? owned : ownedLk);
  const summary = SUMMARIES[topicId as 'analysis' | 'linalg' | 'stochastik']?.[level];
  const levelLabel = level === 'lk' ? 'Leistungskurs' : 'Grundkurs';

  const toggleCard = (id: string) => {
    setOpenCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSolution = (id: string) => {
    setOpenSolutions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Lernen im Reel-Format: gleiche Inhalte, anderes Tempo.
  const openReels = () => {
    try { localStorage.setItem('gf-feed-topic', topicId); } catch { /* Speicher gesperrt */ }
    router.push('/feed');
  };

  // Feste Aktionsleiste: Video · KI · Tutor – immer dieselben drei Aktionen
  // an derselben Position (Übungen wie Zusammenfassung).
  const actionBar = (opts: { scene?: Scene; askCtx: string; askSnippet: string }) => (
    <div className={styles.rowActions}>
      {opts.scene ? (
        <button className={styles.mini} onClick={() => setVideo(opts.scene!)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
          Video ansehen
        </button>
      ) : (
        <span className={`${styles.mini} ${styles.miniOff}`} title="Zu diesem Inhalt entsteht gerade ein Erklärvideo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
          Video folgt
        </span>
      )}
      <button className={styles.mini} onClick={() => onOpenAsk(opts.askCtx, opts.askSnippet)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
          <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
        </svg>
        KI fragen
      </button>
      <span className={`${styles.mini} ${styles.miniOff}`} title="Persönliche Tutoren sind bald verfügbar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
        Tutor · bald
      </span>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.headRow}>
        <h1 className={styles.ph1}>{topic.label}</h1>
        {user && hasAccess && (
          <button className={styles.reelBtn} onClick={openReels} title="Dieses Thema im Reel-Format lernen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="3" /><polyline points="9.5 12.5 12 10 14.5 12.5" /><line x1="12" y1="10" x2="12" y2="15.5" />
            </svg>
            Reel-Modus
          </button>
        )}
      </div>

      {hasAccess && (
        <div className={styles.progressRow}>
          <GrapefruitProgress pct={tasks.length ? (doneCount / tasks.length) * 100 : 0} size={26} />
          <span className={styles.progressLabel}>{doneCount} von {tasks.length} verstanden</span>
        </div>
      )}

      <div className={styles.tabs} role="tablist" aria-label="Bereich wählen">
        <button
          role="tab"
          aria-selected={tab === 'zusammenfassung'}
          className={`${styles.tabBtn} ${tab === 'zusammenfassung' ? styles.tabOn : ''}`}
          onClick={() => setTab('zusammenfassung')}
        >
          Zusammenfassung
        </button>
        <button
          role="tab"
          aria-selected={tab === 'uebungen'}
          className={`${styles.tabBtn} ${tab === 'uebungen' ? styles.tabOn : ''}`}
          onClick={() => setTab('uebungen')}
        >
          Übungen · {tasks.length}
        </button>
      </div>

      {!hasAccess ? (
        <div className={styles.lockCard}>
          <div className={styles.lockBadge} style={{ background: topic.color }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className={styles.lockTitle}>{levelLabel} freischalten</div>
          <p className={styles.lockText}>
            Alle {topic.label}-Inhalte im {levelLabel}: Zusammenfassung mit Formeln,
            Aufgaben mit Schritt-für-Schritt-Lösungen, Erklärvideos und dein KI-Coach.
          </p>
          <button className="btn primary" onClick={() => onOpenCheckout(level)}>
            {levelLabel} freischalten
          </button>
          <p className={styles.lockHint}>Analysis kannst du kostenlos ausprobieren.</p>
        </div>
      ) : tab === 'zusammenfassung' && summary ? (
        <div className={styles.summaryWrap}>
          {summary.sections.map((sec, i) => (
            <div key={sec.title} className={styles.sumCard} style={{ animationDelay: `${i * 45}ms` }}>
              <div className={styles.sumHead}>
                <span className={styles.sumDot} style={{ background: topic.color }} />
                <h3 className={styles.sumTitle}>{sec.title}</h3>
              </div>
              <p className={styles.sumText}>{sec.text}</p>
              <div className={styles.formulas}>
                {sec.formulas.map((f, j) => (
                  <button
                    key={j}
                    className={styles.formula}
                    title="Diese Formel vom Coach erklären lassen"
                    onClick={() => onOpenAsk(topic.label, `Erkläre mir diese Formel aus „${sec.title}": ${f}`)}
                  >
                    <span className={styles.formulaText}>{f}</span>
                    <svg className={styles.formulaAsk} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                      <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                    </svg>
                  </button>
                ))}
              </div>
              {actionBar({
                askCtx: topic.label,
                askSnippet: `Erkläre mir das Thema „${sec.title}": ${sec.text}`,
              })}
            </div>
          ))}
          <div className={styles.summaryFoot}>
            <button className="btn primary" onClick={() => setTab('uebungen')}>
              Jetzt üben
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.cards}>
          {tasks.map((task, i) => {
            const open = openCards.has(task.id);
            const status = statusOf(topicId, task.id);
            const done = status === 'verstanden';
            const scene = task.videoId ? SCENES[task.videoId] : undefined;
            return (
              <div key={task.id} id={`task-${task.id}`} className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
                <button className={styles.cardHead} onClick={() => toggleCard(task.id)} aria-expanded={open}>
                  <span className={`${styles.cardNum} ${done ? styles.cardNumDone : ''}`} style={done ? undefined : { background: topic.color }}>
                    {done ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={styles.cardTitle}>{task.tag}</span>
                  <span className={styles.cardMeta}>
                    {scene && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-label="Mit Erklärvideo">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    )}
                    {status === 'wiederholen' && <span className={styles.headStatus}>Wiederholen</span>}
                    {status === 'unklar' && <span className={styles.headStatus}>Noch unklar</span>}
                  </span>
                  <svg className={styles.chev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>

                {open && (
                  <div className={styles.cardBody}>
                    <p className={styles.taskQ}>{task.q}</p>

                    {/* Eigener Bereich: die Lösung */}
                    <div className={styles.solRow}>
                      <button className={`${styles.mini} ${styles.solBtn}`} onClick={() => toggleSolution(task.id)} aria-expanded={openSolutions.has(task.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points={openSolutions.has(task.id) ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                        </svg>
                        {openSolutions.has(task.id) ? 'Lösung verbergen' : 'Lösung Schritt für Schritt'}
                      </button>
                      <button
                        className={styles.mini}
                        onClick={() => onOpenAsk(topic.label, `Ich habe diese Aufgabe selbst gerechnet und möchte meine Lösung prüfen lassen (Foto oder PDF hochladen): ${task.q}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Eigene Lösung prüfen
                      </button>
                    </div>

                    {openSolutions.has(task.id) && task.steps.length > 0 && (
                      <div className={styles.solution}>
                        <div className={styles.solHead}>
                          <div className={styles.solTitle}>Schritt-für-Schritt-Lösung</div>
                          <span className={styles.solHint}>Tippe auf einen Schritt für mehr Erklärung</span>
                        </div>
                        {task.steps.map((step, si) => (
                          <div
                            key={si}
                            className={styles.sstep}
                            style={{ animationDelay: `${si * 50}ms` }}
                            role="button"
                            tabIndex={0}
                            title="Diesen Schritt vom Coach erklären lassen"
                            onClick={() => onOpenAsk(topic.label, `Schritt ${si + 1} (${step.label}): ${step.math}\n\naus der Aufgabe: ${task.q}`)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onOpenAsk(topic.label, `Schritt ${si + 1} (${step.label}): ${step.math}\n\naus der Aufgabe: ${task.q}`);
                              }
                            }}
                          >
                            <div className={styles.stepNum}>{si + 1}</div>
                            <div className={styles.stepBody}>
                              <div className={styles.stepLd}>{step.label}</div>
                              <div className={styles.stepMt}>{step.math}</div>
                            </div>
                            <svg className={styles.stepGo} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                              <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                            </svg>
                          </div>
                        ))}
                        {task.result && <div className={styles.result}>{task.result}</div>}
                        {task.mistakes && task.mistakes.length > 0 && (
                          <div className={styles.mistakes}>
                            <div className={styles.mistakesTitle}>Typische Fehler</div>
                            <ul className={styles.mistakesList}>
                              {task.mistakes.map((m, mi) => (
                                <li key={mi}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feste Aktionsleiste: immer Video · KI · Tutor */}
                    {actionBar({ scene, askCtx: topic.label, askSnippet: task.q })}

                    {user && (
                      <div className={styles.cardFoot}>
                        <span className={styles.footLabel}>Wie sicher fühlst du dich?</span>
                        <div className={styles.statusSeg}>
                          {STATUS_BTNS.map(b => (
                            <button
                              key={b.status}
                              className={`${styles.statusBtn} ${status === b.status ? styles[`statusOn_${b.status}`] : ''}`}
                              aria-pressed={status === b.status}
                              onClick={() => setStatus(topicId, task.id, status === b.status ? 'none' : b.status)}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.topicFoot}>
        <button className="btn light" onClick={() => onNavigate('dashboard')}>← Zurück</button>
        <button className="btn primary" onClick={() => onOpenAsk(topic.label, '')}>
          Frage stellen
        </button>
      </div>

      <SceneModal scene={video} onClose={() => setVideo(null)} />
    </div>
  );
}
