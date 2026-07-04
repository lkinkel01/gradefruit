'use client';
import { useState, useEffect, useRef } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
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
    color: '#F0524A',
    badge: 'Pflichtbereich',
    gk: ANALYSIS_TASKS,
    lk: ANALYSIS_LK_TASKS,
  },
  linalg: {
    label: 'Lineare Algebra & Geometrie',
    color: '#6C63FF',
    badge: 'Wahlbereich',
    gk: LINALG_TASKS,
    lk: LINALG_LK_TASKS,
  },
  stochastik: {
    label: 'Stochastik',
    color: '#17B26A',
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
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  onOpenAsk: (ctx: string, snippet: string) => void;
  onNavigate: (v: View) => void;
}

type Tab = 'zusammenfassung' | 'uebungen';

export default function TopicView({ topicId, level, owned, ownedLk, onOpenCheckout, onOpenAsk, onNavigate }: Props) {
  const topic = TOPIC_DATA[topicId as string];
  const { user } = useAuth();
  const { isUnderstood, isSaved, toggleUnderstood, toggleSaved } = useProgress();
  const [tab, setTab] = useState<Tab>('zusammenfassung');
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [openSolutions, setOpenSolutions] = useState<Set<string>>(new Set());
  const [video, setVideo] = useState<Scene | null>(null);
  const isFree = topicId === 'analysis';

  const tasks = topic ? topic[level] : [];
  const doneCount = tasks.filter(t => isUnderstood(topicId, t.id)).length;

  // Einstieg: Wer hier schon gelernt hat, landet direkt bei den Übungen.
  // Neue Lernende starten bei der Zusammenfassung. Erste offene Karte aufklappen.
  // Das Ref merkt sich den konsumierten Wunsch-Tab (aus dem Lernfeed), damit
  // Reacts doppelter Effekt-Lauf im Dev-Modus ihn nicht wieder verwirft.
  const consumedTab = useRef<Tab | null>(null);
  useEffect(() => {
    const done = tasks.filter(t => isUnderstood(topicId, t.id)).length;
    // Absprung aus dem Lernfeed: gewünschten Bereich einmalig direkt öffnen.
    let forced: Tab | null = consumedTab.current;
    try {
      const t = localStorage.getItem('gf-open-tab');
      if (t === 'zusammenfassung' || t === 'uebungen') {
        forced = t;
        consumedTab.current = t;
        localStorage.removeItem('gf-open-tab');
      }
    } catch { /* Speicher gesperrt */ }
    setTab(forced ?? (done > 0 ? 'uebungen' : 'zusammenfassung'));
    const firstOpen = tasks.find(t => !isUnderstood(topicId, t.id)) ?? tasks[0];
    setOpenCards(firstOpen ? new Set([firstOpen.id]) : new Set());
    setOpenSolutions(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, level]);

  if (!topic) return null;

  const hasAccess = isFree || (level === 'gk' ? owned : ownedLk);
  const summary = SUMMARIES[topicId as 'analysis' | 'linalg' | 'stochastik']?.[level];
  const levelLabel = level === 'lk' ? 'Leistungskurs' : 'Grundkurs';

  const toggleCard = (id: string) => {
    setOpenCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSolution = (id: string) => {
    setOpenSolutions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.thead}>
        <span className={styles.tbadge} style={{ background: topic.color }}>{topic.badge}</span>
        <span className={styles.levelChip}>{levelLabel}</span>
      </div>
      <h1 className={styles.ph1}>{topic.label}</h1>
      <p className={styles.pblurb}>Prüfungsnahe Aufgaben im Abitur-Stil, mit Zusammenfassung, Formeln und Schritt-für-Schritt-Lösungen.</p>

      {hasAccess && (
        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}%`, background: topic.color }}
            />
          </div>
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className={styles.lockTitle}>{levelLabel} freischalten</div>
          <p className={styles.lockText}>
            Schalte alle {topic.label}-Inhalte im {levelLabel} frei: Zusammenfassung mit
            Formeln, Aufgaben mit Schritt-für-Schritt-Lösungen, Erklärvideos und Fragen an die KI.
          </p>
          <button
            className="btn primary"
            onClick={() => onOpenCheckout(level)}
            style={{ background: topic.color, borderColor: topic.color }}
          >
            {levelLabel} kaufen
          </button>
          <p className={styles.lockHint}>Analysis kannst du kostenlos ausprobieren.</p>
        </div>
      ) : tab === 'zusammenfassung' && summary ? (
        <div className={styles.summaryWrap}>
          <p className={styles.summaryIntro}>{summary.intro}</p>
          <p className={styles.aiHint}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8z" />
            </svg>
            Tippe auf eine Formel und der Coach erklärt sie dir.
          </p>
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
            </div>
          ))}
          <div className={styles.summaryFoot}>
            <button className="btn primary" style={{ background: topic.color, borderColor: topic.color }} onClick={() => setTab('uebungen')}>
              Jetzt üben
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.cards}>
          {tasks.map((task, i) => {
            const open = openCards.has(task.id);
            const done = isUnderstood(topicId, task.id);
            const saved = isSaved(topicId, task.id);
            const scene = task.videoId ? SCENES[task.videoId] : undefined;
            return (
              <div key={task.id} className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
                <button className={styles.cardHead} onClick={() => toggleCard(task.id)} aria-expanded={open}>
                  <span className={`${styles.cardNum} ${done ? styles.cardNumDone : ''}`} style={done ? undefined : { background: topic.color }}>
                    {done ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                    {saved && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-label="Zum Wiederholen gemerkt">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                  </span>
                  <svg className={styles.chev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>

                {open && (
                  <div className={styles.cardBody}>
                    <p className={styles.taskQ}>{task.q}</p>

                    <div className={styles.rowActions}>
                      <button className={styles.mini} onClick={() => toggleSolution(task.id)} aria-expanded={openSolutions.has(task.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points={openSolutions.has(task.id) ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                        </svg>
                        {openSolutions.has(task.id) ? 'Lösung verbergen' : 'Lösung Schritt für Schritt'}
                      </button>
                      {scene && (
                        <button
                          className={styles.mini}
                          style={{ background: topic.color, color: '#fff', borderColor: 'transparent' }}
                          onClick={() => setVideo(scene)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="6 4 20 12 6 20 6 4" />
                          </svg>
                          Video ansehen
                        </button>
                      )}
                      <button className={styles.mini} onClick={() => onOpenAsk(topic.label, task.q)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                          <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                        </svg>
                        KI fragen
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
                      <span className={styles.soonChip} title="Persönliche Tutoren sind bald verfügbar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
                        </svg>
                        Tutor · bald
                      </span>
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

                    {user && (
                      <div className={styles.cardFoot}>
                        <button
                          className={`${styles.mini} ${done ? styles.miniDone : ''}`}
                          onClick={() => toggleUnderstood(topicId, task.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {done ? 'Verstanden' : 'Verstanden?'}
                        </button>
                        <button
                          className={`${styles.mini} ${saved ? styles.miniSaved : ''}`}
                          onClick={() => toggleSaved(topicId, task.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          {saved ? 'Zum Wiederholen gemerkt' : 'Später wiederholen'}
                        </button>
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
