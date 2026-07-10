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

// Lernfeed V3: eine vertikale Lernoberfläche im Reels-Stil mit gemischten
// Karten. Videos spielen automatisch; Formeln, Fehler, Aufgaben, Tipps und
// Motivation sind ruhige Inhaltskarten mit eigenen Aktionen. Alle Inhalte
// stammen aus den echten Daten der Plattform (Aufgaben, Zusammenfassungen).

type TopicId = 'analysis' | 'linalg' | 'stochastik';

const TOPIC_META: Record<TopicId, { label: string; color: string }> = {
  analysis: { label: 'Analysis', color: '#F0524A' },
  linalg: { label: 'Lineare Algebra', color: '#6C63FF' },
  stochastik: { label: 'Stochastik', color: '#17B26A' },
};

// Gleicher (voraussichtlicher) Termin wie auf der Übersicht (Dashboard.tsx).
const EXAM_DATE = new Date('2027-05-03T09:00:00');

// Lernziel je Video (kurz, ehrlich, selbst formuliert).
const GOALS: Record<string, string> = {
  v1: 'Danach leitest du Polynome mit der Potenzregel sicher ab.',
  v2: 'Danach findest du Hoch- und Tiefpunkte ohne Raten.',
  v3: 'Danach berechnest du bestimmte Integrale mit dem Hauptsatz.',
  v4: 'Danach bestimmst du Winkel zwischen Vektoren über das Skalarprodukt.',
  v5: 'Danach stellst du Geradengleichungen auf und prüfst Punkte.',
  v6: 'Danach berechnest du Binomial-Wahrscheinlichkeiten mit Formel statt Bauchgefühl.',
};

const TASK_SOURCES: { topicId: TopicId; tasks: { id: string; tag: string; q: string; mistakes?: string[]; videoId?: string }[] }[] = [
  { topicId: 'analysis', tasks: ANALYSIS_TASKS },
  { topicId: 'linalg', tasks: LINALG_TASKS },
  { topicId: 'stochastik', tasks: STOCHASTIK_TASKS },
];

function linkedTask(sceneId: string): { topicId: TopicId; taskId: string } | null {
  for (const src of TASK_SOURCES) {
    const t = src.tasks.find(x => x.videoId === sceneId);
    if (t) return { topicId: src.topicId, taskId: t.id };
  }
  return null;
}

function taskById(topicId: TopicId, id: string) {
  return TASK_SOURCES.find(s => s.topicId === topicId)!.tasks.find(t => t.id === id)!;
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

// ---------------------------------------------------------------------------
// Kartentypen
// ---------------------------------------------------------------------------
type Card =
  | { kind: 'video'; scene: Scene; task: { topicId: TopicId; taskId: string } | null; minutes: number; path: string; goal: string; desc: string }
  | { kind: 'formel'; topicId: TopicId; sectionTitle: string; formula: string; note: string }
  | { kind: 'zusammenfassung'; topicId: TopicId; title: string; text: string; formulas: string[] }
  | { kind: 'fehler'; topicId: TopicId; taskId: string; tag: string; mistake: string }
  | { kind: 'aufgabe'; topicId: TopicId; taskId: string; tag: string; q: string }
  | { kind: 'tipp'; title: string; text: string }
  | { kind: 'motivation'; text: string };

const video = (id: string): Card => {
  const scene = SCENES[id];
  return {
    kind: 'video',
    scene,
    task: linkedTask(id),
    minutes: estimateMinutes(scene),
    path: curvePath(scene),
    goal: GOALS[id] ?? 'Danach beherrschst du dieses Thema sicherer.',
    desc: scene.intro.split('. ')[0] + '.',
  };
};

const fehler = (topicId: TopicId, taskId: string, index = 0): Card => {
  const t = taskById(topicId, taskId);
  return { kind: 'fehler', topicId, taskId, tag: t.tag, mistake: t.mistakes?.[index] ?? '' };
};

const aufgabe = (topicId: TopicId, taskId: string): Card => {
  const t = taskById(topicId, taskId);
  return { kind: 'aufgabe', topicId, taskId, tag: t.tag, q: t.q };
};

// Formeln und Kurz-Zusammenfassungen: identisch mit src/lib/summaries.ts.
const FEED: Card[] = [
  video('v1'),
  {
    kind: 'formel', topicId: 'analysis', sectionTitle: 'Extrempunkte',
    formula: 'f″(x₀) < 0 → Hochpunkt\nf″(x₀) > 0 → Tiefpunkt',
    note: 'Die zweite Ableitung verrät die Krümmung und damit die Art des Extrempunkts.',
  },
  aufgabe('analysis', 'an4'),
  video('v2'),
  fehler('analysis', 'an1', 0),
  {
    kind: 'tipp', title: 'Operatoren ernst nehmen',
    text: '„Bestimmen", „Zeigen", „Begründen" verlangen unterschiedlich viel. Bei „Zeigen" musst du jeden Schritt hinschreiben, sonst gibt es Punktabzug, auch wenn das Ergebnis stimmt.',
  },
  video('v3'),
  {
    kind: 'zusammenfassung', topicId: 'analysis', title: 'Tangente und Normale',
    text: 'Die Tangente berührt den Graphen mit der Steigung f′(x₀). Die Normale steht senkrecht darauf.',
    formulas: ['t(x) = f′(x₀) · (x − x₀) + f(x₀)', 'Normale: m = −1 / f′(x₀)'],
  },
  { kind: 'motivation', text: 'Zehn Minuten am Tag schlagen drei Stunden am Abend vor der Klausur.' },
  video('v4'),
  {
    kind: 'formel', topicId: 'stochastik', sectionTitle: 'Binomialverteilung',
    formula: 'P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ',
    note: 'Zählt Treffer bei n gleichen, unabhängigen Versuchen mit Trefferwahrscheinlichkeit p.',
  },
  fehler('stochastik', 'st11', 0),
  video('v5'),
  {
    kind: 'tipp', title: 'Antwortsatz nicht vergessen',
    text: 'Sachaufgaben enden im Abi mit einem Antwortsatz in ganzen Worten, mit Einheit. Der kostet zehn Sekunden und bringt sichere Punkte.',
  },
  aufgabe('stochastik', 'st12'),
  video('v6'),
  {
    kind: 'zusammenfassung', topicId: 'linalg', title: 'Skalarprodukt und Winkel',
    text: 'Das Skalarprodukt misst Winkel. Ist es null, stehen die Vektoren senkrecht aufeinander.',
    formulas: ['cos φ = (a→ · b→) / (|a→| · |b→|)', 'a→ ⊥ b→  ⇔  a→ · b→ = 0'],
  },
  fehler('linalg', 'lg1', 0),
  video('l1'),
  { kind: 'motivation', text: 'Du musst nicht alles auf einmal können. Nur heute ein Stück mehr als gestern.' },
];

const KIND_LABEL: Record<Card['kind'], string> = {
  video: 'Erklärvideo',
  formel: 'Formel des Tages',
  zusammenfassung: 'Zusammenfassung',
  fehler: 'Typischer Fehler',
  aufgabe: 'Beispielaufgabe',
  tipp: 'Abi-Tipp',
  motivation: 'Motivation',
};

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isSaved, toggleSaved } = useProgress();
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Lernfeed ist nur für eingeloggte Nutzer. Gäste zur Startseite schicken.
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    setDaysLeft(Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86_400_000)));
  }, []);

  // Aktuelle Karte aus der Scroll-Position ableiten. Das aktive Video spielt
  // automatisch; wer weiterswipet, stoppt das alte und startet das nächste.
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

  const ask = (ctx: string, snippet: string) => {
    setAskCtx(ctx);
    setAskSnippet(snippet);
    setAskOpen(true);
  };

  const share = async () => {
    const url = 'https://www.gradefruit.de/feed';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Gradefruit Lernfeed', text: 'Mathe fürs Abi, eine Karte nach der anderen.', url });
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

  // Wiederverwendbare Leisten-Bausteine
  const railBtn = (label: string, onClick: () => void, icon: React.ReactNode, on = false) => (
    <button key={label} className={`${styles.railBtn} ${on ? styles.railOn : ''}`} onClick={onClick}>
      <span className={styles.railIcon}>{icon}</span>
      {label}
    </button>
  );
  const icons = {
    üben: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
    formeln: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    ki: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" /><circle cx="12" cy="17.5" r=".6" fill="currentColor" /></svg>,
    merken: (filled: boolean) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
    teilen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>,
    lösen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  };

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
          <div className={styles.counter}>Karte {idx + 1} von {FEED.length} · {KIND_LABEL[FEED[idx].kind]}</div>
        </div>
        <div className={styles.topSpacer} />
      </div>

      <div className={styles.feed} ref={feedRef} onScroll={onScroll}>
        {FEED.map((card, i) => {
          const next = i < FEED.length - 1
            ? `Als Nächstes: ${KIND_LABEL[FEED[i + 1].kind]}`
            : 'Du bist durch! Neue Karten kommen laufend dazu.';

          // ------------------------------ Video ------------------------------
          if (card.kind === 'video') {
            const { scene } = card;
            const saved = card.task ? isSaved(card.task.topicId, card.task.taskId) : false;
            return (
              <section key={`v-${scene.id}`} className={styles.slide}>
                <div className={styles.frame}>
                  <div
                    className={styles.stage}
                    style={{ background: `radial-gradient(120% 90% at 50% 8%, ${scene.color}55 0%, ${scene.color}18 42%, transparent 70%), #141110` }}
                  >
                    <svg className={styles.curve} viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
                      <path d={card.path} fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {scene.func && <div className={styles.func}>{scene.func}</div>}
                  </div>

                  {i === idx && (
                    <div className={styles.playerWrap}>
                      <ScenePlayer scene={scene} autoPlay />
                    </div>
                  )}

                  <aside className={styles.rail}>
                    {card.task && railBtn('Üben', () => openTopic(card.task!.topicId, 'uebungen'), icons.üben)}
                    {card.task && railBtn('Formeln', () => openTopic(card.task!.topicId, 'zusammenfassung'), icons.formeln)}
                    {railBtn('KI fragen', () => ask(scene.topic, `Zum Video „${scene.title}": `), icons.ki)}
                    {card.task && railBtn(saved ? 'Gemerkt' : 'Merken', () => toggleSaved(card.task!.topicId, card.task!.taskId), icons.merken(saved), saved)}
                    {railBtn('Teilen', share, icons.teilen)}
                  </aside>

                  {i !== idx && (
                    <div className={styles.meta}>
                      <div className={styles.chips}>
                        <span className={styles.chip} style={{ background: scene.color }}>{scene.topic}</span>
                        <span className={styles.chipGhost}>≈ {card.minutes} Min.</span>
                      </div>
                      <h2 className={styles.title}>{scene.title}</h2>
                      <p className={styles.desc}>{card.desc}</p>
                    </div>
                  )}

                  <div className={styles.next}>{next}</div>
                </div>
              </section>
            );
          }

          // --------------------------- Inhaltskarten ---------------------------
          const meta = 'topicId' in card ? TOPIC_META[card.topicId] : null;
          const accent = meta?.color ?? '#EE7457';
          const label = KIND_LABEL[card.kind];

          return (
            <section key={`${card.kind}-${i}`} className={styles.slide}>
              <div className={styles.frame}>
                <div
                  className={styles.stage}
                  style={{ background: `radial-gradient(120% 90% at 50% 10%, ${accent}44 0%, ${accent}14 45%, transparent 72%), #141110` }}
                >
                  <div className={styles.content}>
                    <span className={styles.typeChip} style={{ background: accent }}>{label}</span>
                    {meta && <span className={styles.topicTag}>{meta.label}</span>}

                    {card.kind === 'formel' && (
                      <>
                        <h2 className={styles.cTitle}>{card.sectionTitle}</h2>
                        <div className={styles.bigFormula}>{card.formula}</div>
                        <p className={styles.cText}>{card.note}</p>
                      </>
                    )}

                    {card.kind === 'zusammenfassung' && (
                      <>
                        <h2 className={styles.cTitle}>{card.title}</h2>
                        <p className={styles.cText}>{card.text}</p>
                        <div className={styles.formulaList}>
                          {card.formulas.map((f, j) => (
                            <div key={j} className={styles.formulaPill}>{f}</div>
                          ))}
                        </div>
                      </>
                    )}

                    {card.kind === 'fehler' && (
                      <>
                        <div className={styles.fehlerIcon}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        </div>
                        <h2 className={styles.cTitle}>{card.tag}</h2>
                        <p className={styles.cTextBig}>{card.mistake}</p>
                      </>
                    )}

                    {card.kind === 'aufgabe' && (
                      <>
                        <h2 className={styles.cTitle}>{card.tag}</h2>
                        <div className={styles.taskBox}>{card.q}</div>
                        <button className={styles.cta} onClick={() => openTopic(card.topicId, 'uebungen')}>
                          Direkt lösen
                        </button>
                      </>
                    )}

                    {card.kind === 'tipp' && (
                      <>
                        <div className={styles.tippIcon}>
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18h6" /><path d="M10 22h4" />
                            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
                          </svg>
                        </div>
                        <h2 className={styles.cTitle}>{card.title}</h2>
                        <p className={styles.cTextBig}>{card.text}</p>
                      </>
                    )}

                    {card.kind === 'motivation' && (
                      <>
                        {daysLeft !== null && (
                          <div className={styles.motDays}>
                            <span className={styles.motNum}>{daysLeft}</span>
                            <span className={styles.motLabel}>Tage bis zur Prüfung</span>
                          </div>
                        )}
                        <p className={styles.motText}>{card.text}</p>
                        <button className={styles.cta} onClick={() => openTopic('analysis', 'uebungen')}>
                          Jetzt üben
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <aside className={styles.rail}>
                  {card.kind === 'formel' && (
                    <>
                      {railBtn('Erklären', () => ask(meta!.label, `Erkläre mir diese Formel (${card.sectionTitle}): ${card.formula.replace('\n', ', ')}`), icons.ki)}
                      {railBtn('Formeln', () => openTopic(card.topicId, 'zusammenfassung'), icons.formeln)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                  {card.kind === 'zusammenfassung' && (
                    <>
                      {railBtn('Weiterlesen', () => openTopic(card.topicId, 'zusammenfassung'), icons.formeln)}
                      {railBtn('KI fragen', () => ask(meta!.label, `Zur Zusammenfassung „${card.title}": `), icons.ki)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                  {card.kind === 'fehler' && (
                    <>
                      {railBtn('Üben', () => openTopic(card.topicId, 'uebungen'), icons.üben)}
                      {railBtn('KI fragen', () => ask(meta!.label, `Warum ist das ein typischer Fehler (${card.tag})? ${card.mistake}`), icons.ki)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                  {card.kind === 'aufgabe' && (
                    <>
                      {railBtn('Lösen', () => openTopic(card.topicId, 'uebungen'), icons.lösen)}
                      {railBtn('KI fragen', () => ask(meta!.label, `Zur Aufgabe (${card.tag}): ${card.q}`), icons.ki)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                  {card.kind === 'tipp' && (
                    <>
                      {railBtn('KI fragen', () => ask('Abi-Tipp', `Zum Tipp „${card.title}": ${card.text}`), icons.ki)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                  {card.kind === 'motivation' && (
                    <>
                      {railBtn('Üben', () => openTopic('analysis', 'uebungen'), icons.üben)}
                      {railBtn('Teilen', share, icons.teilen)}
                    </>
                  )}
                </aside>

                <div className={styles.next}>{next}</div>
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
