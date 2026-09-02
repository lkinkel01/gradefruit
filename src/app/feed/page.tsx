'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { LernStatus } from '@/lib/types';
import { SCENES, Scene } from '@/lib/scenes';
import { indexFor } from '@/lib/contentIndex';
import { gespeicherteStufe, stufeAus, type Stufe } from '@/lib/stufe';
import { ScenePlayer } from '@/components/SceneModal';
import AppTabBar from '@/components/AppTabBar';
import { ArrowRightIcon } from '@/components/UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';
import { GrapefruitSpinner } from '@/components/Logo';
import styles from './feed.module.css';

type TopicId = 'analysis' | 'linalg' | 'stochastik';

interface VideoCard {
  scene: Scene;
  task: { topicId: TopicId; taskId: string } | null;
  path: string;
};

// Nur die Zuordnung Video → Aufgabe; der Aufgabentext wird hier nie gezeigt.
// Die Stufe muss stimmen: Sonst markiert ein LK-Schüler im Reel-Modus
// Grundkurs-Aufgaben, und sein eigener Fortschritt bewegt sich nicht.
function taskSources(stufe: Stufe): {
  topicId: TopicId;
  tasks: { id: string; videoId?: string }[];
}[] {
  return [
    { topicId: 'analysis', tasks: indexFor('analysis', stufe).tasks },
    { topicId: 'linalg', tasks: indexFor('linalg', stufe).tasks },
    { topicId: 'stochastik', tasks: indexFor('stochastik', stufe).tasks },
  ];
}

// Bewertung des laufenden Videos. Steht oben unter den Fortschrittsstreifen:
// Dort verdeckt sie weder das Bild noch die Beschriftung, und man sieht auf
// einen Blick, wie die Aufgabe zum Video eingeordnet ist.
const STATUS_OPTIONS: { status: Exclude<LernStatus, 'none'>; label: string }[] = [
  { status: 'verstanden', label: 'Verstanden' },
  { status: 'wiederholen', label: 'Wiederholen' },
  { status: 'unklar', label: 'Nicht verstanden' },
];

function linkedTask(sceneId: string, stufe: Stufe): VideoCard['task'] {
  for (const source of taskSources(stufe)) {
    const task = source.tasks.find(item => item.videoId === sceneId);
    if (task) return { topicId: source.topicId, taskId: task.id };
  }
  return null;
}

function curvePath(scene: Scene): string {
  const width = 400;
  const height = 300;
  const padding = 40;
  const samples = 64;
  const fn = scene.graph ? scene.graph.fn : (x: number) => Math.sin(x) * 1.1;
  const xMin = scene.graph ? scene.graph.xMin : -3.4;
  const xMax = scene.graph ? scene.graph.xMax : 3.4;
  const xs: number[] = [];
  const ys: number[] = [];

  for (let index = 0; index <= samples; index++) {
    const x = xMin + ((xMax - xMin) * index) / samples;
    xs.push(x);
    ys.push(fn(x));
  }

  const yMin = Math.min(...ys);
  const ySpan = Math.max(...ys) - yMin || 1;
  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const scaleY = (y: number) => height - padding - ((y - yMin) / ySpan) * (height - 2 * padding);

  return xs
    .map((x, index) => `${index ? 'L' : 'M'} ${scaleX(x).toFixed(1)} ${scaleY(ys[index]).toFixed(1)}`)
    .join(' ');
}

function videoCard(scene: Scene, stufe: Stufe): VideoCard {
  return {
    scene,
    task: linkedTask(scene.id, stufe),
    path: curvePath(scene),
  };
}

const ALL_VIDEO_IDS = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'];

function buildFeed(topic: TopicId | null, stufe: Stufe): VideoCard[] {
  const allVideos = ALL_VIDEO_IDS
    .map(id => SCENES[id])
    .filter((scene): scene is Scene => Boolean(scene))
    .map(scene => videoCard(scene, stufe));
  const topicVideos = topic
    ? allVideos.filter(card => card.task?.topicId === topic)
    : allVideos;

  return topicVideos.length > 0 ? topicVideos : allVideos;
}

function BackIcon() {
  return (
    <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m10 17-5-5 5-5" />
    </svg>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // In der App bleibt die Navigation auch im Reel-Modus erreichbar — so macht
  // es Instagram, und ohne sie ist der Reel-Modus eine Sackgasse.
  const imApp = useImAppRahmen();
  const { statusOf, setStatus, owned, ownedLk } = useProgress();
  // Der Reel-Modus liegt auf einer eigenen Route und kommt nicht an der
  // Kursstufe aus page.tsx vorbei — er ermittelt sie deshalb selbst, nach
  // derselben Regel.
  const [wahl, setWahl] = useState<Stufe>('gk');
  useEffect(() => { setWahl(gespeicherteStufe()); }, []);
  const stufe = stufeAus(owned, ownedLk, wahl);
  const [index, setIndex] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(null);
  // Der Reel-Modus folgt dem Erscheinungsbild — also muss auch die
  // Navigationsleiste wissen, welches gerade gilt. Der Wert steht am <body>,
  // gesetzt vom Inline-Skript in layout.tsx, bevor React anläuft.
  const [dunkel, setDunkel] = useState(false);
  useEffect(() => { setDunkel(document.body.classList.contains('dark')); }, []);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    let storedTopic: TopicId | null = null;
    try {
      const value = localStorage.getItem('gf-feed-topic');
      if (value === 'analysis' || value === 'linalg' || value === 'stochastik') storedTopic = value;
    } catch { /* Lokaler Speicher ist nicht verfügbar. */ }

    // Kein requestAnimationFrame: Im Hintergrund wird nicht gezeichnet, und der
    // Themen-Fokus käme nie an.
    const frame = window.setTimeout(() => {
      setTopic(storedTopic);
      setIndex(0);
    }, 0);
    return () => window.clearTimeout(frame);
  }, []);

  const feed = useMemo(() => buildFeed(topic, stufe), [topic, stufe]);
  const activeCard = feed[Math.min(index, Math.max(0, feed.length - 1))];
  const activeStatus = activeCard?.task
    ? statusOf(activeCard.task.topicId, activeCard.task.taskId)
    : 'none';

  const onScroll = () => {
    const element = feedRef.current;
    if (!element) return;
    // Aus der tatsächlichen Höhe eines Reels rechnen, nicht aus der des
    // Behälters — siehe Tastatur-Navigation weiter unten.
    const hoehe = element.scrollHeight / Math.max(1, feed.length);
    const nextIndex = Math.round(element.scrollTop / hoehe);
    if (nextIndex !== index && nextIndex >= 0 && nextIndex < feed.length) setIndex(nextIndex);
  };

  // Desktop wie TikTok: Pfeil hoch/runter wechselt zum nächsten Video.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const element = feedRef.current;
      if (!element) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = Math.min(Math.max(index + direction, 0), feed.length - 1);
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      // Zum Kind scrollen statt zu rechnen: Die Höhe eines Reels ist 100dvh,
      // und die stimmt nicht immer auf das Pixel mit der Höhe des Behälters
      // überein — dann landet die Rechnung zwischen zwei Reels.
      const ziel = element.children[next] as HTMLElement | undefined;
      if (!ziel) return;
      element.scrollTo({ top: ziel.offsetTop, behavior: reduce ? 'auto' : 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, feed.length]);

  const chooseStatus = (status: Exclude<LernStatus, 'none'>) => {
    if (!activeCard?.task) return;
    setStatus(
      activeCard.task.topicId,
      activeCard.task.taskId,
      activeStatus === status ? 'none' : status,
    );
  };

  const goBack = () => {
    try {
      const returnTo = sessionStorage.getItem('gf-feed-return');
      if (returnTo?.startsWith('/') && !returnTo.startsWith('//') && !returnTo.startsWith('/feed')) {
        sessionStorage.removeItem('gf-feed-return');
        router.push(returnTo);
        return;
      }
    } catch { /* Lokaler Speicher ist nicht verfügbar. */ }

    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/?view=dashboard');
  };

  if (loading || !user || !activeCard) {
    return (
      <div className={styles.gate}>
        <GrapefruitSpinner size={52} label={loading ? 'Reel-Modus lädt …' : 'Weiterleitung …'} />
      </div>
    );
  }

  // Aufgabe zum Video öffnen — der Weg vom Zuschauen ins Üben. Die Schlüssel
  // sind dieselben, die TopicView beim nächsten Besuch der Startseite abholt.
  const openTask = () => {
    if (!activeCard.task) return;
    try {
      localStorage.setItem('gf-open-topic', activeCard.task.topicId);
      localStorage.setItem('gf-open-tab', 'uebungen');
      localStorage.setItem('gf-open-task', activeCard.task.taskId);
    } catch { /* Lokaler Speicher ist nicht verfügbar. */ }
    router.push('/?view=dashboard');
  };

  return (
    <main className={`${styles.wrap} ${imApp ? styles.imApp : ''}`}>
      <div className={styles.feed} ref={feedRef} onScroll={onScroll}>
        {feed.map((card, cardIndex) => {
          const isActive = cardIndex === index;
          return (
            <section
              key={card.scene.id}
              className={styles.slide}
              aria-label={`${card.scene.title}, Video ${cardIndex + 1} von ${feed.length}`}
            >
              <div className={styles.frame}>
                {/* Der große Kurvenzug ist Hintergrund, kein Inhalt: Er gibt der
                    Fläche Bewegung, während der eigentliche Graph auf der Bühne
                    das Bild trägt. Deshalb sehr blass. */}
                <div className={styles.poster} aria-hidden="true">
                  <svg className={styles.posterCurve} viewBox="0 0 400 300" preserveAspectRatio="none">
                    <path d={card.path} />
                  </svg>
                </div>

                {isActive && <ScenePlayer scene={card.scene} autoPlay variant="reel" />}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bewerten gehört nach oben: Dort liegt es unter den
          Fortschrittsstreifen und verdeckt weder Bild noch Beschriftung. */}
      <div className={styles.statusBar} aria-label="Lernstatus für das aktuelle Video">
        {/* Ohne verknüpfte Aufgabe wäre die Bewertung wortlos wirkungslos —
            man tippt, und nichts geschieht. Die Erklärvideos gibt es bisher
            nur für den Grundkurs; im Leistungskurs sind sie sehenswert, aber
            an keine Aufgabe gebunden. Das gehört gesagt, nicht versteckt. */}
        {!activeCard.task && (
          <span className={styles.statusHinweis}>
            Erklärvideo aus dem Grundkurs — im Leistungskurs ohne Aufgabe zum Bewerten.
          </span>
        )}
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.status}
            type="button"
            className={`${styles.statusButton} ${activeStatus === option.status ? styles.statusButtonActive : ''}`}
            aria-pressed={activeStatus === option.status}
            disabled={!activeCard.task}
            onClick={() => chooseStatus(option.status)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Aktionsspalte rechts: zur Aufgabe springen und zurückgehen. Der Weg
          zurück steht bewusst hier unten in Daumenreichweite und nicht als
          Pfeil oben links — dort ist im Reel kein Platz neben der Bewertung. */}
      <div className={styles.rail} aria-label="Aktionen zum aktuellen Video">
        {activeCard.task && (
          <button type="button" className={styles.railButton} onClick={openTask}>
            <span className={styles.railIcon}><ArrowRightIcon size={22} /></span>
            <span className={styles.railLabel}>Aufgabe</span>
          </button>
        )}

        <button type="button" className={styles.railButton} onClick={goBack}>
          <span className={styles.railIcon}><BackIcon /></span>
          <span className={styles.railLabel}>Zurück</span>
        </button>
      </div>

      {imApp && (
        <AppTabBar
          view={'videos' as never}
          // Bewusst ein echter Seitenwechsel statt router.push.
          //
          // Die Startseite liest ihren Standort (`?view=…`) genau einmal beim
          // Einhängen. Kommt man vom Reel zurück und Next stellt die schon
          // gerenderte Seite aus seinem Speicher wieder her, hängt sie sich
          // nicht neu ein — der Klick auf „Konto" oder „Lernen" tat dann beim
          // ersten Mal nichts und erst beim zweiten Anlauf etwas. Ein echter
          // Seitenwechsel kann das nicht passieren.
          onNavigate={(ziel) => { window.location.assign(`/?view=${ziel}`); }}
          onReels={() => { /* schon hier */ }}
          dunkel={dunkel}
          kompaktErlaubt={false}
        />
      )}
    </main>
  );
}
