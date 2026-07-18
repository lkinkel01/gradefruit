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
  const { statusOf, setStatus } = useProgress();
  const [index, setIndex] = useState(0);
  const [topic, setTopic] = useState<TopicId | null>(null);
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
              </div>
            </section>
          );
        })}
      </div>

      <nav className={styles.bottomNav} aria-label="Reel-Navigation">
        <button onClick={goBack} aria-label="Zurück">
          <BackIcon />
        </button>
        <button onClick={() => router.push('/?view=dashboard')} aria-label="Zur Übersicht">
          <HomeIcon />
        </button>
      </nav>
    </main>
  );
}
