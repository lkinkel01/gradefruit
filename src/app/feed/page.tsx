'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { LernStatus } from '@/lib/types';
import { SCENES, Scene } from '@/lib/scenes';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { LINALG_TASKS } from '@/lib/linalgTasks';
import { STOCHASTIK_TASKS } from '@/lib/stochastikTasks';
import { ScenePlayer } from '@/components/SceneModal';
import { GrapefruitSpinner } from '@/components/Logo';
import styles from './feed.module.css';

type TopicId = 'analysis' | 'linalg' | 'stochastik';

interface VideoCard {
  scene: Scene;
  task: { topicId: TopicId; taskId: string } | null;
  path: string;
  goal: string;
}

const TOPIC_LABELS: Record<TopicId, string> = {
  analysis: 'Analysis',
  linalg: 'Lineare Algebra',
  stochastik: 'Stochastik',
};

const GOALS: Record<string, string> = {
  v1: 'Polynome sicher mit der Potenzregel ableiten.',
  v2: 'Hoch- und Tiefpunkte systematisch bestimmen.',
  v3: 'Bestimmte Integrale mit dem Hauptsatz berechnen.',
  v4: 'Winkel zwischen Vektoren über das Skalarprodukt bestimmen.',
  v5: 'Geradengleichungen aufstellen und Punkte prüfen.',
  v6: 'Binomialwahrscheinlichkeiten sicher berechnen.',
};

const TASK_SOURCES: {
  topicId: TopicId;
  tasks: { id: string; videoId?: string }[];
}[] = [
  { topicId: 'analysis', tasks: ANALYSIS_TASKS },
  { topicId: 'linalg', tasks: LINALG_TASKS },
  { topicId: 'stochastik', tasks: STOCHASTIK_TASKS },
];

const STATUS_OPTIONS: { status: Exclude<LernStatus, 'none'>; label: string }[] = [
  { status: 'verstanden', label: 'Verstanden' },
  { status: 'wiederholen', label: 'Wiederholen' },
  { status: 'unklar', label: 'Nicht verstanden' },
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
    goal: GOALS[scene.id] ?? 'Dieses Thema Schritt für Schritt verstehen.',
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

function ContinueIcon() {
  return (
    <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6l1.2 1.2L12 21l7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V3" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { statusOf, setStatus } = useProgress();
  const [index, setIndex] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  useEffect(() => {
    let storedTopic: TopicId | null = null;
    let storedLikes = new Set<string>();
    try {
      const value = localStorage.getItem('gf-feed-topic');
      if (value === 'analysis' || value === 'linalg' || value === 'stochastik') storedTopic = value;
      const rawLikes = localStorage.getItem('gf-feed-likes');
      if (rawLikes) storedLikes = new Set(JSON.parse(rawLikes) as string[]);
    } catch { /* Lokaler Speicher ist nicht verfügbar. */ }

    const frame = requestAnimationFrame(() => {
      setTopic(storedTopic);
      setLiked(storedLikes);
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
    const nextIndex = Math.round(element.scrollTop / element.clientHeight);
    if (nextIndex !== index && nextIndex >= 0 && nextIndex < feed.length) setIndex(nextIndex);
  };

  const chooseStatus = (status: Exclude<LernStatus, 'none'>) => {
    if (!activeCard?.task) return;
    setStatus(
      activeCard.task.topicId,
      activeCard.task.taskId,
      activeStatus === status ? 'none' : status,
    );
  };

  const toggleLike = (sceneId: string) => {
    setLiked(current => {
      const next = new Set(current);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      try { localStorage.setItem('gf-feed-likes', JSON.stringify([...next])); } catch { /* Lokaler Speicher ist nicht verfügbar. */ }
      return next;
    });
  };

  const share = async () => {
    const url = `${window.location.origin}/feed`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Gradefruit Reel-Modus',
          text: activeCard?.scene.title ?? 'Mathe Schritt für Schritt verstehen.',
          url,
        });
        return;
      }
    } catch { /* Teilen wurde abgebrochen. */ }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { /* Zwischenablage ist nicht verfügbar. */ }
  };

  const continueLearning = () => {
    if (!activeCard?.task) {
      router.push('/?view=dashboard');
      return;
    }
    const params = new URLSearchParams({
      view: activeCard.task.topicId,
      tab: 'uebungen',
      task: activeCard.task.taskId,
    });
    router.push(`/?${params.toString()}`);
  };

  if (loading || !user || !activeCard) {
    return (
      <div className={styles.gate}>
        <GrapefruitSpinner size={52} label={loading ? 'Reel-Modus lädt …' : 'Weiterleitung …'} />
      </div>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.statusBar} aria-label="Lernstatus für das aktuelle Video">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.status}
            className={`${styles.statusButton} ${activeStatus === option.status ? styles.statusButtonActive : ''}`}
            aria-pressed={activeStatus === option.status}
            disabled={!activeCard.task}
            onClick={() => chooseStatus(option.status)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className={styles.feed} ref={feedRef} onScroll={onScroll}>
        {feed.map((card, cardIndex) => {
          const isActive = cardIndex === index;
          const isLiked = liked.has(card.scene.id);
          return (
            <section
              key={card.scene.id}
              className={styles.slide}
              aria-label={`${card.scene.title}, Video ${cardIndex + 1} von ${feed.length}`}
            >
              <div className={styles.frame}>
                <div className={styles.poster} aria-hidden="true">
                  <svg className={styles.posterCurve} viewBox="0 0 400 300" preserveAspectRatio="none">
                    <path d={card.path} />
                  </svg>
                  {card.scene.func && <span>{card.scene.func}</span>}
                </div>

                {isActive && (
                  <div className={styles.playerWrap}>
                    <ScenePlayer scene={card.scene} autoPlay variant="reel" />
                  </div>
                )}

                <aside className={styles.rail} aria-label="Aktionen für das aktuelle Video">
                  <button
                    className={`${styles.railButton} ${isLiked ? styles.railButtonLiked : ''}`}
                    aria-pressed={isLiked}
                    onClick={() => toggleLike(card.scene.id)}
                  >
                    <span className={styles.railIcon}><HeartIcon filled={isLiked} /></span>
                    <span>{isLiked ? 'Gefällt dir' : 'Gefällt mir'}</span>
                  </button>
                  <button className={styles.railButton} onClick={share}>
                    <span className={styles.railIcon}><ShareIcon /></span>
                    <span>Teilen</span>
                  </button>
                </aside>

                <div className={styles.meta}>
                  <span>{card.task ? TOPIC_LABELS[card.task.topicId] : card.scene.topic}</span>
                  <strong>{card.scene.title}</strong>
                  <p>{card.goal}</p>
                </div>

                <div className={styles.reelCount} aria-hidden="true">
                  {cardIndex + 1} / {feed.length}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <nav className={styles.bottomNav} aria-label="Reel-Navigation">
        <button onClick={() => router.push('/?view=dashboard')} aria-label="Zur Übersicht">
          <HomeIcon />
        </button>
        <button className={styles.continueButton} onClick={continueLearning} aria-label="Weiterlernen">
          <ContinueIcon />
        </button>
      </nav>

      {copied && <div className={styles.toast}>Link kopiert</div>}
    </main>
  );
}
