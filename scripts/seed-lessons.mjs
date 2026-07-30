// Legt für jede Aufgabe des Kurses eine Lektion in der Datenbank an.
//
// WARUM DAS NÖTIG IST: Der Lernstatus („verstanden", „wiederholen", „nicht
// verstanden") hängt an der Tabelle `progress`, und die zeigt per Fremdschlüssel
// auf `lessons`. Fehlt zu einer Aufgabe die Lektion, lässt sich ihr Status nicht
// speichern — und zwar lautlos: Die Oberfläche zeigt die Einordnung an, beim
// nächsten Laden ist sie weg.
//
// Das Skript ist absichtlich additiv: Es legt nur an, was fehlt, und fasst
// vorhandene Zeilen nicht an. Mehrfaches Ausführen ist gefahrlos.
//
// Aufruf:  node --env-file=.env.local scripts/seed-lessons.mjs [--schreiben]
// Ohne --schreiben wird nur berichtet, was fehlt.

import { createClient } from '@supabase/supabase-js';
import { CONTENT_INDEX } from '../src/lib/contentIndex.ts';

const schreiben = process.argv.includes('--schreiben');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const THEMEN = ['analysis', 'linalg', 'stochastik'];
const STUFEN = ['gk', 'lk'];

// 1) Themen-IDs holen — die Lektion hängt am Thema, nicht am Kurs.
const { data: themen, error: themenFehler } = await supabase
  .from('topics')
  .select('id, slug');

if (themenFehler || !themen?.length) {
  console.error('Themen konnten nicht gelesen werden:', themenFehler?.message);
  process.exit(1);
}
const themaId = Object.fromEntries(themen.map(t => [t.slug, t.id]));

// 2) Alle Aufgaben aus dem Inhaltsverzeichnis, in stabiler Reihenfolge.
//    GK vor LK, damit sort_order bei erneutem Lauf gleich bleibt.
const aufgaben = [];
for (const thema of THEMEN) {
  let position = 0;
  for (const stufe of STUFEN) {
    for (const aufgabe of CONTENT_INDEX[thema][stufe].tasks) {
      position += 1;
      aufgaben.push({
        slug: aufgabe.id,
        title: aufgabe.tag,
        topic_id: themaId[thema],
        sort_order: position,
        thema,
        stufe,
      });
    }
  }
}

// 3) Abgleich mit dem Bestand.
const { data: vorhanden, error: lesenFehler } = await supabase
  .from('lessons')
  .select('slug');

if (lesenFehler) {
  console.error('Lektionen konnten nicht gelesen werden:', lesenFehler.message);
  process.exit(1);
}

const bekannt = new Set((vorhanden ?? []).map(l => l.slug));
const fehlend = aufgaben.filter(a => !bekannt.has(a.slug));

console.log(`Aufgaben im Kurs:        ${aufgaben.length}`);
console.log(`Lektionen in der DB:     ${bekannt.size}`);
console.log(`Fehlende Lektionen:      ${fehlend.length}`);

if (fehlend.length === 0) {
  console.log('\nVERDICT: PASS — jede Aufgabe hat ihre Lektion.');
  process.exit(0);
}

const nachThema = {};
fehlend.forEach(a => {
  const schluessel = `${a.thema}/${a.stufe}`;
  nachThema[schluessel] = (nachThema[schluessel] ?? 0) + 1;
});
console.log('Verteilung:', JSON.stringify(nachThema));

if (!schreiben) {
  console.log('\nProbelauf — nichts geschrieben. Mit --schreiben tatsächlich anlegen.');
  console.log('VERDICT: FAIL — es fehlen Lektionen.');
  process.exit(1);
}

// 4) Anlegen. In Blöcken, damit eine große Menge nicht an einer Grenze scheitert.
const BLOCK = 25;
let angelegt = 0;
for (let i = 0; i < fehlend.length; i += BLOCK) {
  const block = fehlend.slice(i, i + BLOCK).map(({ slug, title, topic_id, sort_order }) => ({
    slug, title, topic_id, sort_order,
  }));
  const { error } = await supabase.from('lessons').insert(block);
  if (error) {
    console.error(`Block ab ${i} fehlgeschlagen:`, error.message);
    process.exit(1);
  }
  angelegt += block.length;
  console.log(`… ${angelegt}/${fehlend.length} angelegt`);
}

// 5) Nachprüfen statt behaupten.
const { data: danach } = await supabase.from('lessons').select('slug');
const jetztBekannt = new Set((danach ?? []).map(l => l.slug));
const immerNochFehlend = aufgaben.filter(a => !jetztBekannt.has(a.slug));

console.log(`\nLektionen jetzt:         ${jetztBekannt.size}`);
console.log(`Noch fehlend:            ${immerNochFehlend.length}`);
console.log(`\nVERDICT: ${immerNochFehlend.length === 0 ? 'PASS — jede Aufgabe hat ihre Lektion.' : 'FAIL — bitte prüfen.'}`);
process.exit(immerNochFehlend.length === 0 ? 0 : 1);
