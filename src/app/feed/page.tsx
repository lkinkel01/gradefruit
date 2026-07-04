'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { SCENES, Scene } from '@/lib/scenes';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { LINALG_TASKS } from '@/lib/linalgTasks';
import { STOCHASTIK_TASKS } from '@/lib/stochastikTasks';
import { ScenePlayer } from '@/components/SceneModal';
import AskDrawer from '@/components/AskDrawer';
import styles from './feed.module.css';

// Lernfeed V2: volle Video-Bühne, Overlays wie bei TikTok/Reels, Lernaktionen
// rechts. Abspielen im bewährten SceneModal-Player, KI im echten Coach-Drawer.

// Lernziel je Video (kurz, ehrlich, selbst formuliert).
const GOALS: Record<string, string> = {
  v1: 'Danach leitest du Polynome mit der Potenzregel sicher ab.',
  v2: 'Danach findest du Hoch- und Tiefpunkte ohne Raten.',
  v3: 'Danach berechnest du bestimmte Integrale mit dem Hauptsatz.',
  v4: 'Danach bestimmst du Winkel zwischen Vektoren über das Skalarprodukt.',
  v5: 'Danach stellst du Geradengleichungen auf und prüfst Punkte.',
  v6: 'Danach berechnest du Binomial-Wahrscheinlichkeiten mit Formel statt Bauchgefühl.',
};

// Zu jedem Video die passende Übungsaufgabe (über videoId verknüpft).
const TASK_SOURCES: { topicId: 'analysis' | 'linalg' | 'stochastik'; tasks: { id: string; videoId?: string }[] }[] = [
  { topicId: 'analysis', tasks: ANALYSIS_TASKS },
  { topicId: 'linalg', tasks: LINALG_TASKS },
  { topicId: 'stochastik', tasks: STOCHASTIK_TASKS },
];

function linkedTask(sceneId: string): { topicId: 'analysis' | 'linalg' | 'stochastik'; taskId: string } | null {
  for (const src of TASK_SOURCES) {
    const t = src.tasks.find(x => x.videoId === sceneId);
    if (t) return { topicId: src.topicId, taskId: t.id };
  }
  return null;
}

// Dezente Kurve als Bühnen-Hintergrund: echter Graph der Szene, sonst Sinus.
function curvePath(scene: Scene): string {
  const W = 400;
  const H = 300;
  const pad = 40;
  const N = 64;
  const fn = scene.graph ? scene.graph.fn : (x: number) => Math.sin(x) * 1.1;
  const x0 = scene.graph ? scene.graph.xMin : -3.4;
  const x1 = scene.graph ? scene.graph.xMax : 3.4;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N;
    xs.push(x);
    ys.push(fn(x));
  }
  const yMin = Math.min(...ys);
  const span = Math.max(...ys) - yMin || 1;
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - pad - ((y - yMin) / span) * (H - 2 * pad);
  return xs.map((x, i) => `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`).join(' ');
}

// Geschätzte Dauer aus der Sprechtext-Länge (≈ 800 Zeichen pro Minute).
function estimateMinutes(scene: Scene): number {
  const text = [scene.intro, ...scene.steps.map(s => s.say), scene.outro].join(' ');
  return Math.max(1, Math.round(text.length / 800));
}

const FEED = Object.values(SCENES).map(scene => ({
  scene,
  goal: GOALS[scene.id] ?? 'Danach beherrschst du dieses Thema sicherer.',
  desc: scene.intro.split('. ')[0] + '.',
  minutes: estimateMinutes(scene),
  path: curvePath(scene),
  task: linkedTask(scene.id),
}));

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isSaved, toggleSaved } = useProgress();
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Lernfeed ist nur für eingeloggte Nutzer. Gäste zur Startseite schicken.
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  // Aktuelles Video aus der Scroll-Position ableiten. Der aktive Slide spielt
  // automatisch; wer weiterswipet, stoppt das alte Video und startet das neue.
  const onScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx && i >= 0 && i < FEED.length) setIdx(i);
  };

  const openTopic = (topicId: string, tab: 'zusammenfassung' | 'uebungen') => {
    try {
      localStorage.setItem('gf-open-topic', topicId);
      localStorage.setItem('gf-open-tab', tab);
    } catch { /* Speicher gesperrt */ }
    router.push('/');
  };

  const share = async () => {
    const url = 'https://www.gradefruit.de/feed';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Gradefruit Lernfeed', text: 'Mathe fürs Abi, ein Video nach dem anderen.', url });
        return;
      }
    } catch { /* Nutzer hat das Teilen abgebrochen */ }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* Zwischenablage gesperrt */ }
  };

  if (loading || !user) {
    return <div className={styles.gate}>{loading ? 'Laden …' : 'Weiterleitung …'}</div>;
  }

  return (
    <div className={styles.wrap}>
      {/* Kopf-Overlay: zurück, Fortschritt, Zähler */}
      <div className={styles.top}>
        <button className={styles.back} onClick={() => router.back()} aria-label="Zurück">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.segments}>
            {FEED.map((_, i) => (
              <span key={i} className={`${styles.segment} ${i <= idx ? styles.segmentOn : ''}`} />
            ))}
          </div>
          <div className={styles.counter}>Video {idx + 1} von {FEED.length}</div>
        </div>
        <div className={styles.topSpacer} />
      </div>

      <div className={styles.feed} ref={feedRef} onScroll={onScroll}>
        {FEED.map((item, i) => {
          const { scene } = item;
          const saved = item.task ? isSaved(item.task.topicId, item.task.taskId) : false;
          return (
            <section key={scene.id} className={styles.slide}>
              <div className={styles.frame}>
                {/* Video-Bühne */}
                <div
                  className={styles.stage}
                  style={{ background: `radial-gradient(120% 90% at 50% 8%, ${scene.color}55 0%, ${scene.color}18 42%, transparent 70%), #0C0B11` }}
                >
                  <svg className={styles.curve} viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                    <path d={item.path} fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  {scene.func && <div className={styles.func}>{scene.func}</div>}
                </div>

                {/* Der aktive Slide spielt von selbst, wie bei TikTok */}
                {i === idx && (
                  <div className={styles.playerWrap}>
                    <ScenePlayer scene={scene} autoPlay />
                  </div>
                )}

                {/* Aktions-Leiste rechts */}
                <aside className={styles.rail}>
                  {item.task && (
                    <button className={styles.railBtn} onClick={() => openTopic(item.task!.topicId, 'uebungen')}>
                      <span className={styles.railIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                        </svg>
                      </span>
                      Üben
                    </button>
                  )}
                  {item.task && (
                    <button className={styles.railBtn} onClick={() => openTopic(item.task!.topicId, 'zusammenfassung')}>
                      <span className={styles.railIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </span>
                      Formeln
                    </button>
                  )}
                  <button
                    className={styles.railBtn}
                    onClick={() => { setAskCtx(scene.topic); setAskSnippet(`Zum Video „${scene.title}": `); setAskOpen(true); }}
                  >
                    <span className={styles.railIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
                        <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
                      </svg>
                    </span>
                    KI fragen
                  </button>
                  {item.task && (
                    <button
                      className={`${styles.railBtn} ${saved ? styles.railOn : ''}`}
                      onClick={() => toggleSaved(item.task!.topicId, item.task!.taskId)}
                    >
                      <span className={styles.railIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </span>
                      {saved ? 'Gemerkt' : 'Merken'}
                    </button>
                  )}
                  <button className={styles.railBtn} onClick={share}>
                    <span className={styles.railIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </span>
                    Teilen
                  </button>
                  <span className={styles.railSoon} title="Persönliche Tutoren sind bald verfügbar">
                    <span className={styles.railIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
                      </svg>
                    </span>
                    Tutor · bald
                  </span>
                </aside>

                {/* Info-Overlay unten (nur solange das Video hier nicht läuft;
                    der Player zeigt Thema und Titel selbst) */}
                {i !== idx && (
                <div className={styles.meta}>
                  <div className={styles.chips}>
                    <span className={styles.chip} style={{ background: scene.color }}>{scene.topic}</span>
                    <span className={styles.chipGhost}>≈ {item.minutes} Min.</span>
                  </div>
                  <h2 className={styles.title}>{scene.title}</h2>
                  <p className={styles.desc}>{item.desc}</p>
                  <p className={styles.goal}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" fill="currentColor" />
                    </svg>
                    {item.goal}
                  </p>
                </div>
                )}

                {/* Nächstes Thema */}
                {i < FEED.length - 1 ? (
                  <div className={styles.next}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polyline points="18 15 12 9 6 15" transform="rotate(180 12 12)" />
                    </svg>
                    Nächstes Thema: {FEED[i + 1].scene.title}
                  </div>
                ) : (
                  <div className={styles.next}>Du bist durch! Neue Videos kommen laufend dazu.</div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {copied && <div className={styles.toast}>Link kopiert</div>}

      <AskDrawer open={askOpen} ctx={askCtx} snippet={askSnippet} onClose={() => setAskOpen(false)} />
    </div>
  );
}
