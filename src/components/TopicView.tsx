'use client';
import { useState, useEffect, useRef } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import styles from './TopicView.module.css';
import SceneModal from './SceneModal';
import { SCENES, Scene } from '@/lib/scenes';
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
  mistakes?: string[]; // 2 typische Fehler (optional)
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
  owned: boolean;
  ownedLk: boolean;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  onOpenAsk: (ctx: string, snippet: string) => void;
  onNavigate: (v: View) => void;
}

export default function TopicView({ topicId, owned, ownedLk, onOpenCheckout, onOpenAsk, onNavigate }: Props) {
  const topic = TOPIC_DATA[topicId as string];
  const { user } = useAuth();
  const { isUnderstood, isSaved, toggleUnderstood, toggleSaved } = useProgress();
  const [openSolutions, setOpenSolutions] = useState<Set<string>>(new Set());
  const [video, setVideo] = useState<Scene | null>(null);
  const [level, setLevel] = useState<'gk' | 'lk'>('gk');
  const userPickedLevel = useRef(false);
  const isFree = topicId === 'analysis';

  // LK-only-Schüler automatisch auf den LK-Tab schicken (und GK-only auf GK),
  // solange sie die Stufe nicht selbst angetippt haben. Analysis ist gratis –
  // dort bleibt die Wahl immer frei.
  useEffect(() => {
    if (userPickedLevel.current || isFree) return;
    if (level === 'gk' && !owned && ownedLk) setLevel('lk');
    else if (level === 'lk' && !ownedLk && owned) setLevel('gk');
  }, [owned, ownedLk, isFree, level]);

  if (!topic) return null;

  const tasks = topic[level];
  const hasAccess = level === 'gk' ? isFree || owned : isFree || ownedLk;

  const toggle = (id: string) => {
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
      </div>
      <h1 className={styles.ph1}>{topic.label}</h1>
      <p className={styles.pblurb}>Prüfungsnahe Aufgaben im Abitur-Stil – mit Schritt-für-Schritt-Lösungen.</p>

      <div className={styles.levelSwitch} role="tablist" aria-label="Kursniveau wählen">
        <button
          role="tab"
          aria-selected={level === 'gk'}
          className={`${styles.levelBtn} ${level === 'gk' ? styles.levelBtnActive : ''}`}
          style={level === 'gk' ? { background: topic.color, borderColor: topic.color } : undefined}
          onClick={() => { userPickedLevel.current = true; setLevel('gk'); }}
        >
          Grundkurs
        </button>
        <button
          role="tab"
          aria-selected={level === 'lk'}
          className={`${styles.levelBtn} ${level === 'lk' ? styles.levelBtnActive : ''}`}
          style={level === 'lk' ? { background: topic.color, borderColor: topic.color } : undefined}
          onClick={() => { userPickedLevel.current = true; setLevel('lk'); }}
        >
          Leistungskurs
        </button>
      </div>

      {hasAccess && tasks.map(task => (
        <div key={task.id} className={styles.task}>
          <div className={styles.taskHead}>
            <div className={styles.taskTag}>
              <span className={styles.lbl}>{task.tag}</span>
              <span className={styles.src}>{task.src}</span>
            </div>
            <p className={styles.taskQ}>{task.q}</p>
            <div className={styles.rowActions}>
              {task.locked && !hasAccess ? (
                <button className="btn primary btn sm" style={{ fontSize: 13 }} onClick={() => onOpenCheckout(level)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Lösung freischalten
                </button>
              ) : (
                <>
                  {task.videoId && SCENES[task.videoId] && (
                    <button
                      className={styles.mini}
                      style={{ background: topic.color, color: '#fff', borderColor: 'transparent' }}
                      onClick={() => setVideo(SCENES[task.videoId!])}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      Video ansehen
                    </button>
                  )}
                  <button
                    className={styles.mini}
                    onClick={() => toggle(task.id)}
                    aria-expanded={openSolutions.has(task.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points={openSolutions.has(task.id) ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                    {openSolutions.has(task.id) ? 'Lösung verbergen' : 'Lösung zeigen'}
                  </button>
                  <button
                    className={styles.mini}
                    onClick={() => onOpenAsk(topic.label, task.q)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                      <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                    </svg>
                    KI fragen
                  </button>
                  {user && (
                    <>
                      <button
                        className={`${styles.mini} ${isUnderstood(topicId, task.id) ? styles.miniDone : ''}`}
                        onClick={() => toggleUnderstood(topicId, task.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {isUnderstood(topicId, task.id) ? 'Verstanden' : 'Verstanden?'}
                      </button>
                      <button
                        className={`${styles.mini} ${isSaved(topicId, task.id) ? styles.miniSaved : ''}`}
                        onClick={() => toggleSaved(topicId, task.id)}
                        aria-label="Aufgabe speichern"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved(topicId, task.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        {isSaved(topicId, task.id) ? 'Gespeichert' : 'Speichern'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {openSolutions.has(task.id) && task.steps.length > 0 && (
            <div className={styles.solution}>
              <div className={styles.solInner}>
                <div className={styles.solTitle}>Schritt-für-Schritt-Lösung</div>
                {task.steps.map((step, i) => (
                  <div key={i} className={styles.sstep}>
                    <div className={styles.stepNum}>{i + 1}</div>
                    <div className={styles.stepBody}>
                      <div className={styles.stepLd}>{step.label}</div>
                      <div className={styles.stepMt}>{step.math}</div>
                      <button
                        className={styles.stepAsk}
                        onClick={() => onOpenAsk(topic.label, `Schritt ${i + 1} (${step.label}): ${step.math}\n\naus der Aufgabe: ${task.q}`)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                          <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                        </svg>
                        Diesen Schritt erklären
                      </button>
                    </div>
                  </div>
                ))}
                {task.result && (
                  <div className={styles.result}>{task.result}</div>
                )}
                {task.mistakes && task.mistakes.length > 0 && (
                  <div className={styles.mistakes}>
                    <div className={styles.mistakesTitle}>Typische Fehler</div>
                    <ul className={styles.mistakesList}>
                      {task.mistakes.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {!hasAccess && (
        <div className={styles.lockCard}>
          <div className={styles.lockBadge} style={{ background: topic.color }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className={styles.lockTitle}>
            {level === 'lk' ? 'Leistungskurs freischalten' : 'Grundkurs freischalten'}
          </div>
          <p className={styles.lockText}>
            Schalte alle {topic.label}-Aufgaben{level === 'lk' ? ' im Leistungskurs' : ''} mit
            Schritt-für-Schritt-Lösungen, Erklärvideos und Fragen an die KI frei.
          </p>
          <button
            className="btn primary"
            onClick={() => onOpenCheckout(level)}
            style={{ background: topic.color, borderColor: topic.color }}
          >
            {level === 'lk' ? 'Leistungskurs kaufen' : 'Grundkurs kaufen'}
          </button>
          <p className={styles.lockHint}>Analysis kannst du in beiden Stufen kostenlos ausprobieren.</p>
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
