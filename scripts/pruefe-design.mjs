/**
 * Prüft, ob der Code die Regeln aus DESIGN.md einhält.
 *
 * Ein Brandbook nützt nur, wenn Abweichungen auffallen. Dieses Skript zählt
 * sie und gibt am Ende ein VERDICT aus, wie die anderen Prüfskripte auch.
 *
 *   node scripts/pruefe-design.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const GROESSEN = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32, 40];
const STAERKEN = [400, 500, 600, 700, 800, 900];

/** Bewusste Ausnahmen, in DESIGN.md Abschnitt 9 begründet. */
const RADIUS_ERLAUBT = new Set(['50%', '0']);

function cssDateien(ordner) {
  const raus = [];
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) raus.push(...cssDateien(pfad));
    else if (name.endsWith('.css')) raus.push(pfad);
  }
  return raus;
}

const befunde = { groesse: [], staerke: [], radius: [], abstand: [] };

for (const datei of cssDateien('src')) {
  const text = readFileSync(datei, 'utf8');
  const kurz = datei.replace('src/', '');

  for (const m of text.matchAll(/font-size:\s*([0-9.]+)px/g)) {
    const px = Number(m[1]);
    if (!GROESSEN.includes(px)) befunde.groesse.push(`${kurz}: ${px}px`);
  }

  for (const m of text.matchAll(/font-weight:\s*([0-9]+)/g)) {
    const w = Number(m[1]);
    if (!STAERKEN.includes(w)) befunde.staerke.push(`${kurz}: ${w}`);
  }

  for (const m of text.matchAll(/border-radius:\s*([^;]+)/g)) {
    const wert = m[1].trim();
    if (wert.includes('var(') || RADIUS_ERLAUBT.has(wert)) continue;
    befunde.radius.push(`${kurz}: ${wert}`);
  }

  for (const m of text.matchAll(/\b(?:margin|padding|gap)[a-z-]*:([^;{}]+)/g)) {
    const wert = m[1];
    // Gerechnete, variable und negative Werte sind ausgenommen.
    if (/clamp|calc|var\(|%|auto|-/.test(wert)) continue;
    for (const px of wert.matchAll(/\b(\d+)px\b/g)) {
      // Unter 4px sind optische Korrekturen, keine Abstände aus dem Raster.
      if (Number(px[1]) >= 4) befunde.abstand.push(`${kurz}: ${px[1]}px`);
    }
  }
}

const zeilen = [
  ['Schriftgrößen ausserhalb der Skala', befunde.groesse],
  ['Schriftstärken ohne geladenen Schnitt', befunde.staerke],
  ['Radien ohne Token', befunde.radius],
  ['Abstände ohne Token', befunde.abstand],
];

let fehler = 0;
for (const [titel, liste] of zeilen) {
  console.log(`${liste.length === 0 ? 'OK  ' : 'FEHL'} ${titel}: ${liste.length}`);
  for (const eintrag of liste.slice(0, 8)) console.log(`       ${eintrag}`);
  if (liste.length > 8) console.log(`       … und ${liste.length - 8} weitere`);
  fehler += liste.length;
}

console.log('');
console.log(fehler === 0
  ? 'VERDICT: PASS — der Code hält die Regeln aus DESIGN.md ein.'
  : `VERDICT: FAIL — ${fehler} Abweichungen von DESIGN.md.`);
process.exit(fehler === 0 ? 0 : 1);
