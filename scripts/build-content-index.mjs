// Erzeugt src/lib/contentIndex.ts aus den server-seitigen Inhalten.
//
// Der Index ist das Einzige, was der Browser noch ohne Zugangsprüfung sieht:
// Überschriften, IDs und Anzahlen. Aufgabentexte, Lösungswege, Ergebnisse,
// typische Fehler und Formeln bleiben auf dem Server.
//
// Aufruf:  node scripts/build-content-index.mjs
// Nach jeder Änderung an den Inhalten neu ausführen.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'src/server/content');

const [an, anLk, li, liLk, st, stLk, sums] = await Promise.all([
  import(join(content, 'analysisTasks.ts')),
  import(join(content, 'analysisLkTasks.ts')),
  import(join(content, 'linalgTasks.ts')),
  import(join(content, 'linalgLkTasks.ts')),
  import(join(content, 'stochastikTasks.ts')),
  import(join(content, 'stochastikLkTasks.ts')),
  import(join(content, 'summaries.ts')),
]);

const TASKS = {
  analysis: { gk: an.ANALYSIS_TASKS, lk: anLk.ANALYSIS_LK_TASKS },
  linalg: { gk: li.LINALG_TASKS, lk: liLk.LINALG_LK_TASKS },
  stochastik: { gk: st.STOCHASTIK_TASKS, lk: stLk.STOCHASTIK_LK_TASKS },
};
const SUMMARIES = sums.SUMMARIES;

const index = {};
let tasksTotal = 0;
for (const topic of ['analysis', 'linalg', 'stochastik']) {
  index[topic] = {};
  for (const level of ['gk', 'lk']) {
    const tasks = TASKS[topic][level].map(t => ({
      id: t.id,
      tag: t.tag,
      ...(t.videoId ? { videoId: t.videoId } : {}),
    }));
    const sections = SUMMARIES[topic][level].sections.map(s => ({ title: s.title }));
    index[topic][level] = { tasks, sections };
    tasksTotal += tasks.length;
  }
}

const file = `// AUTOMATISCH ERZEUGT von scripts/build-content-index.mjs — nicht von Hand ändern.
//
// Inhaltsverzeichnis für die Navigation: nur IDs und Überschriften. Diese Datei
// darf im Browser landen. Die eigentlichen Inhalte (Aufgabentexte, Lösungswege,
// Ergebnisse, typische Fehler, Formeln) liegen in src/server/content/ und
// kommen ausschließlich über /api/content — nach Zugangsprüfung.

export type ContentTopic = 'analysis' | 'linalg' | 'stochastik';
export type ContentLevel = 'gk' | 'lk';

export interface IndexTask {
  id: string;
  tag: string;
  videoId?: string;
}

export interface IndexSection {
  title: string;
}

export interface TopicIndex {
  tasks: IndexTask[];
  sections: IndexSection[];
}

export const CONTENT_INDEX: Record<ContentTopic, Record<ContentLevel, TopicIndex>> =
${JSON.stringify(index, null, 2)};

/** Aufgaben eines Themas in der gewählten Stufe — nur Überschriften. */
export function indexFor(topic: ContentTopic, level: ContentLevel): TopicIndex {
  return CONTENT_INDEX[topic][level];
}
`;

writeFileSync(join(root, 'src/lib/contentIndex.ts'), file);
console.log(`contentIndex.ts geschrieben: ${tasksTotal} Aufgaben, 6 Zusammenfassungen.`);
