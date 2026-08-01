'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { LernStatus } from '@/lib/types';
import { SCENES, Scene } from '@/lib/scenes';
import { indexFor } from '@/lib/contentIndex';
import { ScenePlayer } from '@/components/SceneModal';
import AppTabBar from '@/components/AppTabBar';
import { CheckIcon, ReviewIcon, QuestionIcon, ArrowRightIcon } from '@/components/UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';
import { GrapefruitSpinner } from '@/components/Logo';
import styles from './feed.module.css';

type TopicId = 'analysis' | 'linalg' | 'stochastik';

interface VideoCard {
  scene: Scene;
  task: { topicId: TopicId; taskId: string } | null;
  path: string;
};

const TASK_SOURCES: {
  topicId: TopicId;
  tasks: { id: string; videoId?: string }[];
}[] = [
  // Nur die Zuordnung Video → Aufgabe; der Aufgabentext wird hier nie gezeigt.
  { topicId: 'analysis', tasks: indexFor('analysis', 'gk').tasks },
  { topicId: 'linalg', tasks: indexFor('linalg', 'gk').tasks },
  { topicId: 'stochastik', tasks: indexFor('stochastik', 'gk').tasks },
];

// Die Aktionsspalte rechts — das Merkmal, an dem ein Reel als Reel erkannt
// wird. Sie ersetzt die frühere Pillenleiste am oberen Rand: Die lag über dem
// Bild, war weit weg vom Daumen und sah aus wie ein Filter, nicht wie eine
// Bewertung.
const STATUS_OPTIONS: {
  status: Exclude<LernStatus, 'none'>;
  label: string;
  icon: ReactNode;
}[] = [
  { status: 'verstanden', label: 'Verstanden', icon: <CheckIcon size={22} /> },
  { status: 'wiederholen', label: 'Wiederholen', icon: <ReviewIcon size={22} /> },
  { status: 'unklar', label: 'Unklar', icon: <QuestionIcon size={22} /> },
];

function linkedTask(sceneId: string): VideoCard['task'] {
  for (const source of TASK_SOURCES) {
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

function videoCard(scene: Scene): VideoCard {
  return {
    scene,
    task: linkedTask(scene.id),
    path: curvePath(scene),
  };
}

const ALL_VIDEO_IDS = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'];

function buildFeed(topic: TopicId | null): VideoCard[] {
  const allVideos = ALL_VIDEO_IDS
    .map(id => SCENES[id])
    .filter((scene): scene is Scene => Boolean(scene))
    .map(videoCard);
  const topicVideos = topic
    ? allVideos.filter(card => card.task?.topicId === topic)
    : allVideos;

  return topicVideos.length > 0 ? topicVideos : allVideos;
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
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
  const { statusOf, setStatus } = useProgress();
  const [index, setIndex] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Der helle Streifen hinter der Statusleiste passt nicht zum dunklen
  // Reel-Modus — hier reicht das eigene Dunkel bis nach oben durch.
  useEffect(() => {
    // Nicht 'transparent': darunter liegt der native Fensterhintergrund, und der
    // ist hell — genau deshalb blieb der Balken weiß. Also die Reel-Farbe setzen.
    document.documentElement.style.setProperty('--top-strip', '#050505');
    return () => { document.documentElement.style.removeProperty('--top-strip'); };
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    let storedTopic: TopicId | null = null;
    try {
      const value = localStorage.getItem('gf-feed-topic');
      if (value === 'analysis' || value === 'linalg' || value === 'stochastik') storedTopic = value;
    } catch { /* Lokaler Speicher ist nicht verfügbar. */ }

    const frame = requestAnimationFrame(() => {
      setTopic(storedTopic);
      setIndex(0);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const feed = useMemo(() => buildFeed(topic), [topic]);
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

      {/* Oben links zurück — sonst gehört der obere Rand den Fortschrittsstreifen. */}
      <button className={styles.back} onClick={goBack} aria-label="Zurück">
        <BackIcon />
      </button>

      {/* Aktionsspalte rechts: bewerten und zur Aufgabe springen. */}
      <div className={styles.rail} aria-label="Aktionen zum aktuellen Video">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.status}
            type="button"
            className={`${styles.railButton} ${activeStatus === option.status ? styles.railButtonActive : ''}`}
            aria-pressed={activeStatus === option.status}
            disabled={!activeCard.task}
            onClick={() => chooseStatus(option.status)}
          >
            <span className={styles.railIcon}>{option.icon}</span>
            <span className={styles.railLabel}>{option.label}</span>
          </button>
        ))}

        {activeCard.task && (
          <button type="button" className={styles.railButton} onClick={openTask}>
            <span className={styles.railIcon}><ArrowRightIcon size={22} /></span>
            <span className={styles.railLabel}>Aufgabe</span>
          </button>
        )}

        <button
          type="button"
          className={styles.railButton}
          onClick={() => router.push('/?view=dashboard')}
        >
          <span className={styles.railIcon}><HomeIcon /></span>
          <span className={styles.railLabel}>Start</span>
        </button>
      </div>

      {imApp && (
        <AppTabBar
          view={'videos' as never}
          onNavigate={(ziel) => router.push(`/?view=${ziel}`)}
          onReels={() => { /* schon hier */ }}
          dunkel
        />
      )}
    </main>
  );
}
