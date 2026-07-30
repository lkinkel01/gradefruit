import { CONTENT_INDEX } from '../src/lib/contentIndex.ts';
import { SCENES } from '../src/lib/scenes.ts';
import { ANALYSIS_TASKS } from '../src/server/content/analysisTasks.ts';
import { ANALYSIS_LK_TASKS } from '../src/server/content/analysisLkTasks.ts';
import { LINALG_TASKS } from '../src/server/content/linalgTasks.ts';
import { LINALG_LK_TASKS } from '../src/server/content/linalgLkTasks.ts';
import { STOCHASTIK_TASKS } from '../src/server/content/stochastikTasks.ts';
import { STOCHASTIK_LK_TASKS } from '../src/server/content/stochastikLkTasks.ts';
import { SUMMARIES } from '../src/server/content/summaries.ts';

const QUELLEN = {
  analysis: { gk: ANALYSIS_TASKS, lk: ANALYSIS_LK_TASKS },
  linalg: { gk: LINALG_TASKS, lk: LINALG_LK_TASKS },
  stochastik: { gk: STOCHASTIK_TASKS, lk: STOCHASTIK_LK_TASKS },
};
const alleSzenen = Object.values(SCENES);
const szenen = new Set(Object.keys(SCENES));
const befunde = [];

for (const thema of ['analysis', 'linalg', 'stochastik']) {
  for (const stufe of ['gk', 'lk']) {
    const echte = QUELLEN[thema][stufe];
    const imIndex = CONTENT_INDEX[thema][stufe].tasks;

    // 1) Index gegen Quelle — driftet das Verzeichnis?
    if (echte.length !== imIndex.length) {
      befunde.push(`${thema}/${stufe}: Index hat ${imIndex.length} Aufgaben, Quelle ${echte.length}`);
    }
    echte.forEach((a, i) => {
      const idx = imIndex[i];
      if (!idx || idx.id !== a.id || idx.tag !== a.tag) {
        befunde.push(`${thema}/${stufe}: Index weicht bei Position ${i + 1} ab (${idx?.id} vs ${a.id})`);
      }
    });

    // 2) Videos: zeigt eine Aufgabe auf ein Video, das es nicht gibt?
    echte.forEach(a => {
      if (a.videoId && !szenen.has(a.videoId)) {
        befunde.push(`${thema}/${stufe}/${a.id}: Video "${a.videoId}" existiert nicht`);
      }
    });

    // 3) Vollständigkeit der Aufgaben
    echte.forEach(a => {
      if (!a.q?.trim()) befunde.push(`${thema}/${stufe}/${a.id}: kein Aufgabentext`);
      if (!a.result?.trim()) befunde.push(`${thema}/${stufe}/${a.id}: kein Ergebnis`);
      if (!a.steps?.length) befunde.push(`${thema}/${stufe}/${a.id}: kein Lösungsweg`);
      if (!a.mistakes?.length) befunde.push(`${thema}/${stufe}/${a.id}: keine typischen Fehler`);
      a.steps?.forEach((s, i) => {
        if (!s.label?.trim() || !s.math?.trim()) {
          befunde.push(`${thema}/${stufe}/${a.id}: Schritt ${i + 1} unvollständig`);
        }
      });
    });

    // 4) Doppelte Überschriften innerhalb eines Themas
    const tags = echte.map(a => a.tag);
    tags.forEach((t, i) => {
      if (tags.indexOf(t) !== i) befunde.push(`${thema}/${stufe}: Überschrift "${t}" kommt doppelt vor`);
    });

    // 5) Zusammenfassungen
    const zf = SUMMARIES[thema][stufe];
    if (!zf?.intro?.trim()) befunde.push(`${thema}/${stufe}: Zusammenfassung ohne Einleitung`);
    zf?.sections?.forEach(s => {
      if (!s.text?.trim()) befunde.push(`${thema}/${stufe}/"${s.title}": Abschnitt ohne Text`);
      if (!s.formulas?.length) befunde.push(`${thema}/${stufe}/"${s.title}": Abschnitt ohne Formeln`);
    });
    const titel = (zf?.sections ?? []).map(s => s.title);
    titel.forEach((t, i) => {
      if (titel.indexOf(t) !== i) befunde.push(`${thema}/${stufe}: Abschnitt "${t}" kommt doppelt vor`);
    });
  }
}

// 6) Videos, die auf keine Aufgabe zeigen
const genutzt = new Set();
for (const thema of Object.keys(QUELLEN)) for (const stufe of ['gk', 'lk'])
  QUELLEN[thema][stufe].forEach(a => a.videoId && genutzt.add(a.videoId));
const ungenutzt = alleSzenen.filter(s => !genutzt.has(s.id));

console.log(`Aufgaben geprüft:  ${Object.values(QUELLEN).flatMap(t => [...t.gk, ...t.lk]).length}`);
console.log(`Videos vorhanden:  ${alleSzenen.length}, davon einer Aufgabe zugeordnet: ${genutzt.size}`);
if (ungenutzt.length) console.log(`Videos ohne Aufgabe: ${ungenutzt.map(s => s.id).join(', ')}`);
console.log(`\nBefunde: ${befunde.length}`);
befunde.slice(0, 40).forEach(b => console.log('  · ' + b));
if (befunde.length > 40) console.log(`  … und ${befunde.length - 40} weitere`);
console.log(`\nVERDICT: ${befunde.length === 0 ? 'PASS — Inhalte sind in sich stimmig.' : 'FAIL — siehe Befunde.'}`);
