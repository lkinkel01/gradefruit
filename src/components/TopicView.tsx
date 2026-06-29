'use client';
import { useState } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import styles from './TopicView.module.css';
import SceneModal from './SceneModal';
import { SCENES, Scene } from '@/lib/scenes';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';

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

const TOPIC_DATA: Record<string, { label: string; color: string; badge: string; tasks: Task[] }> = {
  analysis: {
    label: 'Analysis',
    color: '#F0524A',
    badge: 'Pflichtbereich',
    tasks: ANALYSIS_TASKS,
  },
  linalg: {
    label: 'Lineare Algebra & Geometrie',
    color: '#6C63FF',
    badge: 'Wahlbereich',
    tasks: [
      {
        id: 'l1', tag: 'Vektoren', src: 'Abitur Hessen 2023 · B1',
        q: 'Gegeben sind die Punkte A(1|2|3) und B(4|6|3). Berechnen Sie den Abstand |AB|.',
        steps: [
          { label: 'Verbindungsvektor', math: 'AB⃗ = (4−1, 6−2, 3−3) = (3, 4, 0)' },
          { label: 'Betrag', math: '|AB| = √(3² + 4² + 0²) = √25 = 5' },
        ],
        result: '|AB| = 5',
        locked: false,
        videoId: 'l1',
      },
      {
        id: 'l2', tag: 'Geraden & Ebenen', src: 'Abitur Hessen 2022 · B2',
        q: 'Untersuchen Sie, ob der Punkt P(2|3|1) auf der Geraden g liegt.',
        steps: [],
        result: '',
        locked: true,
      },
    ],
  },
  stochastik: {
    label: 'Stochastik',
    color: '#17B26A',
    badge: 'Pflichtbereich',
    tasks: [
      {
        id: 's1', tag: 'Binomialverteilung', src: 'Abitur Hessen 2023 · C1',
        q: 'Eine faire Münze wird 10-mal geworfen. Wie groß ist P(genau 4 Mal Kopf)?',
        steps: [
          { label: 'Parameter', math: 'n = 10, k = 4, p = 0,5' },
          { label: 'Formel', math: 'P(X=4) = C(10,4) · 0,5⁴ · 0,5⁶' },
          { label: 'Berechnung', math: 'P(X=4) = 210 · 0,0625 · 0,015625' },
        ],
        result: 'P(X=4) ≈ 0,205 (20,5%)',
        locked: false,
        videoId: 'v6',
      },
      {
        id: 's2', tag: 'Bedingte Wahrscheinlichkeit', src: 'Abitur Hessen 2022 · C2',
        q: 'Verwenden Sie den Satz von Bayes für folgende Aufgabe ...',
        steps: [],
        result: '',
        locked: true,
      },
    ],
  },
};

interface Props {
  topicId: View;
  owned: boolean;
  onOpenCheckout: () => void;
  onOpenAsk: (ctx: string, snippet: string) => void;
}

export default function TopicView({ topicId, owned, onOpenCheckout, onOpenAsk }: Props) {
  const topic = TOPIC_DATA[topicId as string];
  const { user } = useAuth();
  const { isUnderstood, isSaved, toggleUnderstood, toggleSaved } = useProgress();
  const [openSolutions, setOpenSolutions] = useState<Set<string>>(new Set());
  const [video, setVideo] = useState<Scene | null>(null);

  if (!topic) return null;

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
      <p className={styles.pblurb}>Echte Abituraufgaben mit Schritt-für-Schritt-Lösungen.</p>

      {topic.tasks.map(task => (
        <div key={task.id} className={styles.task}>
          <div className={styles.taskHead}>
            <div className={styles.taskTag}>
              <span className={styles.lbl}>{task.tag}</span>
              <span className={styles.src}>{task.src}</span>
            </div>
            <p className={styles.taskQ}>{task.q}</p>
            <div className={styles.rowActions}>
              {task.locked && !owned ? (
                <button className="btn primary btn sm" style={{ fontSize: 13 }} onClick={onOpenCheckout}>
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
                    </div>
                  </div>
                ))}
                {task.result && (
                  <div className={styles.result}>{task.result}</div>
                )}
                {task.mistakes && task.mistakes.length > 0 && (
                  <div className={styles.mistakes}>
                    <div className={styles.mistakesTitle}>⚠️ Typische Fehler</div>
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

      <div className={styles.topicFoot}>
        <button className="btn light">← Zurück</button>
        <button className="btn primary" onClick={() => onOpenAsk(topic.label, '')}>
          Frage stellen
        </button>
      </div>

      <SceneModal scene={video} onClose={() => setVideo(null)} />
    </div>
  );
}
