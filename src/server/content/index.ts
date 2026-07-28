// ===========================================================================
// Kursinhalte — SERVER-SEITIG. Verlässt den Server nur über /api/content,
// und dort erst, nachdem der Zugang geprüft wurde.
//
// Das `server-only` oben ist eine echte Schranke: Wird eine dieser Dateien
// versehentlich aus einer Client-Komponente importiert, bricht der Build ab.
// Damit kann niemand die Inhalte aus Versehen wieder in den Browser schicken.
//
// Was der Browser stattdessen bekommt: `src/lib/contentIndex.ts` — nur IDs,
// Überschriften und Anzahlen. Daraus lässt sich nichts lernen und nichts
// weitergeben.
// ===========================================================================
import 'server-only';

import { ANALYSIS_TASKS } from './analysisTasks';
import { ANALYSIS_LK_TASKS } from './analysisLkTasks';
import { LINALG_TASKS } from './linalgTasks';
import { LINALG_LK_TASKS } from './linalgLkTasks';
import { STOCHASTIK_TASKS } from './stochastikTasks';
import { STOCHASTIK_LK_TASKS } from './stochastikLkTasks';
import { SUMMARIES } from './summaries';
import type { TopicSummary } from './summaries';

export type ContentTopic = 'analysis' | 'linalg' | 'stochastik';
export type ContentLevel = 'gk' | 'lk';

/** Eine Aufgabe so, wie der Browser sie nach bestandener Zugangsprüfung sieht. */
export interface ContentTask {
  id: string;
  tag: string;
  src: string;
  q: string;
  steps: { label: string; math: string }[];
  result: string;
  mistakes: string[];
  locked: boolean;
  videoId?: string;
}

const TASKS: Record<ContentTopic, Record<ContentLevel, ContentTask[]>> = {
  analysis: { gk: ANALYSIS_TASKS, lk: ANALYSIS_LK_TASKS },
  linalg: { gk: LINALG_TASKS, lk: LINALG_LK_TASKS },
  stochastik: { gk: STOCHASTIK_TASKS, lk: STOCHASTIK_LK_TASKS },
};

export const CONTENT_TOPICS: ContentTopic[] = ['analysis', 'linalg', 'stochastik'];

export function isContentTopic(value: string): value is ContentTopic {
  return (CONTENT_TOPICS as string[]).includes(value);
}

export function isContentLevel(value: string): value is ContentLevel {
  return value === 'gk' || value === 'lk';
}

export function tasksFor(topic: ContentTopic, level: ContentLevel): ContentTask[] {
  return TASKS[topic][level];
}

export function summaryFor(topic: ContentTopic, level: ContentLevel): TopicSummary {
  return SUMMARIES[topic][level];
}

export type { TopicSummary, SummarySection } from './summaries';
