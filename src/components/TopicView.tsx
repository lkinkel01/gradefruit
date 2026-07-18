'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LernStatus, NavigateTo, TopicTab, View } from '@/lib/types';
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
import { ArrowRightIcon, ChevronIcon, PlayIcon, QuestionIcon, TutorIcon, UploadIcon } from './UiIcons';

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
    color: 'var(--accent)',
    badge: 'Pflichtbereich',
    gk: ANALYSIS_TASKS,
    lk: ANALYSIS_LK_TASKS,
  },
  linalg: {
    label: 'Lineare Algebra & Geometrie',
    color: 'var(--accent)',
    badge: 'Wahlbereich',
    gk: LINALG_TASKS,
    lk: LINALG_LK_TASKS,
  },
  stochastik: {
    label: 'Stochastik',
    color: 'var(--accent)',
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
  tab: TopicTab;
  itemId: string | null;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  onOpenAsk: (ctx: string, snippet: string) => void;
  onNavigate: NavigateTo;
  onLocationChange: (tab: TopicTab, itemId: string | null, itemLabel: string | null) => void;
  onItemLabelChange: (itemLabel: string | null) => void;
}

// Die drei Lernstufen in fester Reihenfolge (Fuß jeder Aufgabe).
const STATUS_BTNS: { status: Exclude<LernStatus, 'none'>; label: string }[] = [
  { status: 'verstanden', label: 'Verstanden' },
  { status: 'wiederholen', label: 'Wiederholen' },
  { status: 'unklar', label: 'Nicht verstanden' },
];

export default function TopicView({
  topicId,
  level,
  owned,
  ownedLk,
  tab,
  itemId,
  onOpenCheckout,
  onOpenAsk,
  onNavigate,
  onLocationChange,
  onItemLabelChange,
}: Props) {
  const router = useRouter();
  const topic = TOPIC_DATA[topicId as string];
  const summary = topic
    ? SUMMARIES[topicId as 'analysis' | 'linalg' | 'stochastik']?.[level]
    : undefined;
  const { user } = useAuth();
  const { statusOf, setStatus } = useProgress();
  const [openSolutions, setOpenSolutions] = useState<Set<string>>(new Set());
  const [openSummaryDetails, setOpenSummaryDetails] = useState<Set<string>>(new Set());
  const [summaryStatuses, setSummaryStatuses] = useState<Record<string, LernStatus>>({});
  const [video, setVideo] = useState<Scene | null>(null);
  const isFree = topicId === 'analysis';

  const tasks = topic ? topic[level] : [];
  const doneCount = tasks.filter(t => statusOf(topicId, t.id) === 'verstanden').length;
  const selectedSummary = tab === 'zusammenfassung'
    ? summary?.sections.find(section => section.title === itemId)
    : undefined;
  const selectedSummaryIndex = selectedSummary
    ? summary?.sections.findIndex(section => section.title === selectedSummary.title) ?? -1
    : -1;
  const selectedTask = tab === 'uebungen' ? tasks.find(task => task.id === itemId) : undefined;
  const selectedTaskIndex = selectedTask ? tasks.findIndex(task => task.id === selectedTask.id) : -1;

  useEffect(() => {
    onItemLabelChange(selectedSummary?.title ?? selectedTask?.tag ?? null);
  }, [onItemLabelChange, selectedSummary?.title, selectedTask?.tag]);

  useEffect(() => {
    let saved: Record<string, LernStatus> = {};
    try {
      const raw = localStorage.getItem('gf-summary-status');
      if (raw) saved = JSON.parse(raw) as Record<string, LernStatus>;
    } catch { /* Speicher gesperrt oder alter ungültiger Wert */ }
    const frame = requestAnimationFrame(() => setSummaryStatuses(saved));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!topic) return null;

  const hasAccess = isFree || (level === 'gk' ? owned : ownedLk);
  const levelLabel = level === 'lk' ? 'Leistungskurs' : 'Grundkurs';

  const toggleSolution = (id: string) => {
    setOpenSolutions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectTab = (nextTab: TopicTab) => {
    setOpenSolutions(new Set());
    setOpenSummaryDetails(new Set());
    onLocationChange(nextTab, null, null);
  };

  const toggleSummaryDetails = (title: string) => {
    setOpenSummaryDetails(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const summaryStatusKey = (title: string) => `${topicId}/${level}/${title}`;
  const setSummaryStatus = (title: string, status: LernStatus) => {
    setSummaryStatuses(prev => {
      const next = { ...prev, [summaryStatusKey(title)]: status };
      try { localStorage.setItem('gf-summary-status', JSON.stringify(next)); } catch { /* Speicher gesperrt */ }
      return next;
    });
  };

  // Lernen im Reel-Format: gleiche Inhalte, anderes Tempo.
  const openReels = () => {
    try { localStorage.setItem('gf-feed-topic', topicId); } catch { /* Speicher gesperrt */ }
    router.push('/feed');
  };

  const actionBar = (opts: { scene?: Scene; askCtx: string; askSnippet: string }) => (
    <div className={styles.rowActions} aria-label="Weitere Lernhilfen">
      <button
        className={styles.mini}
        disabled={!opts.scene}
        onClick={() => opts.scene && setVideo(opts.scene)}
        title={opts.scene ? 'Erklärvideo öffnen' : 'Für diesen Inhalt ist noch kein Video hinterlegt'}
      >
        <PlayIcon size={14} />
        Video
      </button>
      <button className={styles.mini} onClick={() => onOpenAsk(opts.askCtx, opts.askSnippet)}>
        <QuestionIcon size={14} />
        KI fragen
      </button>
      <button className={styles.mini} onClick={() => onNavigate('tutors')}>
        <TutorIcon size={14} />
        Tutor fragen
      </button>
    </div>
  );

  const renderSummaryIndex = () => (
    <div className={styles.contentIndex}>
      {summary?.intro && <p className={styles.indexIntro}>{summary.intro}</p>}
      <div className={styles.indexList}>
        {summary?.sections.map((section, index) => {
          const status = summaryStatuses[summaryStatusKey(section.title)] ?? 'none';
          return (
            <button
              key={section.title}
              className={styles.indexRow}
              onClick={() => onLocationChange('zusammenfassung', section.title, section.title)}
            >
              <span className={styles.indexNumber}>{index + 1}</span>
              <span className={styles.indexText}>
                <strong>{section.title}</strong>
                <small>{section.text}</small>
              </span>
              {status !== 'none' && (
                <span className={styles.headStatus}>
                  {STATUS_BTNS.find(statusButton => statusButton.status === status)?.label}
                </span>
              )}
              <span className={styles.indexArrow} aria-hidden="true"><ArrowRightIcon size={16} /></span>
            </button>
          );
        })}
      </div>
      <div className={styles.summaryFoot}>
        <button className="btn primary" onClick={() => selectTab('uebungen')}>
          Jetzt üben
        </button>
      </div>
    </div>
  );

  const renderSummaryDetail = () => {
    if (!selectedSummary) return renderSummaryIndex();
    const detailsOpen = openSummaryDetails.has(selectedSummary.title);
    const status = summaryStatuses[summaryStatusKey(selectedSummary.title)] ?? 'none';

    return (
      <div className={styles.detailPage}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => onLocationChange('zusammenfassung', null, null)}
        >
          Alle Zusammenfassungen
        </button>
        <article className={`${styles.card} ${styles.cardOpen}`}>
          <header className={styles.detailHeader}>
            <span className={styles.cardNum} style={{ background: topic.color }}>{selectedSummaryIndex + 1}</span>
            <h2 className={styles.detailTitle}>{selectedSummary.title}</h2>
            {status !== 'none' && (
              <span className={styles.headStatus}>
                {STATUS_BTNS.find(statusButton => statusButton.status === status)?.label}
              </span>
            )}
          </header>
          <div className={styles.cardBody}>
            <p className={styles.summaryIntro}>{selectedSummary.text}</p>
            <div className={styles.solRow}>
              <button
                className={`${styles.mini} ${styles.solBtn}`}
                onClick={() => toggleSummaryDetails(selectedSummary.title)}
                aria-expanded={detailsOpen}
              >
                <ChevronIcon direction={detailsOpen ? 'up' : 'down'} size={14} />
                {detailsOpen ? 'Zusammenfassung verbergen' : 'Zusammenfassung anzeigen'}
              </button>
            </div>

            {detailsOpen && (
              <div className={styles.summaryDetails}>
                <div className={styles.formulas}>
                  {selectedSummary.formulas.map((formula, formulaIndex) => (
                    <button
                      key={formulaIndex}
                      className={styles.formula}
                      title="Diese Formel vom Coach erklären lassen"
                      onClick={() => onOpenAsk(topic.label, `Erkläre mir diese Formel aus „${selectedSummary.title}“: ${formula}`)}
                    >
                      <span className={styles.formulaText}>{formula}</span>
                      <QuestionIcon size={14} />
                    </button>
                  ))}
                </div>

                {actionBar({
                  askCtx: topic.label,
                  askSnippet: `Erkläre mir das Thema „${selectedSummary.title}“: ${selectedSummary.text}`,
                })}

                {user && (
                  <div className={styles.cardFoot}>
                    <span className={styles.footLabel}>Wie sicher fühlst du dich?</span>
                    <div className={styles.statusSeg}>
                      {STATUS_BTNS.map(button => (
                        <button
                          key={button.status}
                          className={`${styles.statusBtn} ${status === button.status ? styles[`statusOn_${button.status}`] : ''}`}
                          aria-pressed={status === button.status}
                          onClick={() => setSummaryStatus(selectedSummary.title, status === button.status ? 'none' : button.status)}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      </div>
    );
  };

  const renderExerciseIndex = () => (
    <div className={styles.contentIndex}>
      <div className={styles.indexList}>
        {tasks.map((task, index) => {
          const status = statusOf(topicId, task.id);
          const scene = task.videoId ? SCENES[task.videoId] : undefined;
          return (
            <button
              key={task.id}
              className={styles.indexRow}
              onClick={() => onLocationChange('uebungen', task.id, task.tag)}
            >
              <span className={`${styles.indexNumber} ${status === 'verstanden' ? styles.indexNumberDone : ''}`}>
                {status === 'verstanden' ? <span aria-hidden="true">✓</span> : index + 1}
              </span>
              <span className={styles.indexText}>
                <strong>{task.tag}</strong>
                <small>{task.q}</small>
              </span>
              {scene && <span className={styles.indexVideo}>Video</span>}
              {status !== 'none' && (
                <span className={styles.headStatus}>
                  {STATUS_BTNS.find(statusButton => statusButton.status === status)?.label}
                </span>
              )}
              <span className={styles.indexArrow} aria-hidden="true"><ArrowRightIcon size={16} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderExerciseDetail = () => {
    if (!selectedTask) return renderExerciseIndex();
    const status = statusOf(topicId, selectedTask.id);
    const done = status === 'verstanden';
    const scene = selectedTask.videoId ? SCENES[selectedTask.videoId] : undefined;
    const solutionOpen = openSolutions.has(selectedTask.id);

    return (
      <div className={styles.detailPage}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => onLocationChange('uebungen', null, null)}
        >
          Alle Übungen
        </button>
        <article id={`task-${selectedTask.id}`} className={`${styles.card} ${styles.cardOpen}`}>
          <header className={styles.detailHeader}>
            <span className={`${styles.cardNum} ${done ? styles.cardNumDone : ''}`} style={done ? undefined : { background: topic.color }}>
              {done ? '✓' : selectedTaskIndex + 1}
            </span>
            <h2 className={styles.detailTitle}>{selectedTask.tag}</h2>
            {status !== 'none' && (
              <span className={styles.headStatus}>
                {STATUS_BTNS.find(statusButton => statusButton.status === status)?.label}
              </span>
            )}
          </header>

          <div className={styles.cardBody}>
            <div className={styles.taskBlock}>
              <span className={styles.taskLabel}>Aufgabe</span>
              <p className={styles.taskQ}>{selectedTask.q}</p>
            </div>

            <div className={styles.solRow}>
              <button
                className={`${styles.mini} ${styles.solBtn}`}
                onClick={() => toggleSolution(selectedTask.id)}
                aria-expanded={solutionOpen}
              >
                <ChevronIcon direction={solutionOpen ? 'up' : 'down'} size={14} />
                {solutionOpen ? 'Lösung verbergen' : 'Lösung'}
              </button>
            </div>

            {solutionOpen && (
              <div className={styles.solutionStage}>
                {selectedTask.steps.length > 0 && (
                  <div className={styles.solution}>
                    <div className={styles.solHead}>
                      <div className={styles.solTitle}>Schritt-für-Schritt-Lösung</div>
                      <span className={styles.solHint}>Tippe auf einen Schritt für mehr Erklärung</span>
                    </div>
                    {selectedTask.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={styles.sstep}
                        style={{ animationDelay: `${stepIndex * 50}ms` }}
                        role="button"
                        tabIndex={0}
                        title="Diesen Schritt vom Coach erklären lassen"
                        onClick={() => onOpenAsk(topic.label, `Schritt ${stepIndex + 1} (${step.label}): ${step.math}\n\naus der Aufgabe: ${selectedTask.q}`)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onOpenAsk(topic.label, `Schritt ${stepIndex + 1} (${step.label}): ${step.math}\n\naus der Aufgabe: ${selectedTask.q}`);
                          }
                        }}
                      >
                        <div className={styles.stepNum}>{stepIndex + 1}</div>
                        <div className={styles.stepBody}>
                          <div className={styles.stepLd}>{step.label}</div>
                          <div className={styles.stepMt}>{step.math}</div>
                        </div>
                        <QuestionIcon size={15} />
                      </div>
                    ))}
                    {selectedTask.result && <div className={styles.result}>{selectedTask.result}</div>}
                    {selectedTask.mistakes && selectedTask.mistakes.length > 0 && (
                      <div className={styles.mistakes}>
                        <div className={styles.mistakesTitle}>Typische Fehler</div>
                        <ul className={styles.mistakesList}>
                          {selectedTask.mistakes.map((mistake, mistakeIndex) => (
                            <li key={mistakeIndex}>{mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className={`${styles.mini} ${styles.checkOwn}`}
                  onClick={() => onOpenAsk(topic.label, `Ich habe diese Aufgabe selbst gerechnet und möchte meine Lösung prüfen lassen (Foto oder PDF hochladen): ${selectedTask.q}`)}
                >
                  <UploadIcon size={14} />
                  Eigene Lösung prüfen
                </button>

                {actionBar({ scene, askCtx: topic.label, askSnippet: selectedTask.q })}

                {user && (
                  <div className={styles.cardFoot}>
                    <span className={styles.footLabel}>Wie sicher fühlst du dich?</span>
                    <div className={styles.statusSeg}>
                      {STATUS_BTNS.map(button => (
                        <button
                          key={button.status}
                          className={`${styles.statusBtn} ${status === button.status ? styles[`statusOn_${button.status}`] : ''}`}
                          aria-pressed={status === button.status}
                          onClick={() => setStatus(topicId, selectedTask.id, status === button.status ? 'none' : button.status)}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      </div>
    );
  };

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
          onClick={() => selectTab('zusammenfassung')}
        >
          Zusammenfassung
        </button>
        <button
          role="tab"
          aria-selected={tab === 'uebungen'}
          className={`${styles.tabBtn} ${tab === 'uebungen' ? styles.tabOn : ''}`}
          onClick={() => selectTab('uebungen')}
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
        selectedSummary ? renderSummaryDetail() : renderSummaryIndex()
      ) : (
        selectedTask ? renderExerciseDetail() : renderExerciseIndex()
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
