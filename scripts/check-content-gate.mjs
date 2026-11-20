// Prüft die Zugangsschranke von /api/content mit einem echten Testkonto.
// Aufruf: node --env-file=.env.local scripts/check-content-gate.mjs <email> <passwort>

import { createClient } from '@supabase/supabase-js';

const [email, password] = process.argv.slice(2);
const base = 'http://127.0.0.1:3000';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) { console.error('Anmeldung fehlgeschlagen:', error.message); process.exit(1); }
const token = data.session.access_token;

async function call(label, query, headers) {
  const res = await fetch(`${base}/api/content?${query}`, { headers });
  const body = await res.json().catch(() => ({}));
  const aufgaben = Array.isArray(body.tasks) ? body.tasks.length : 0;
  const abschnitte = body.summary?.sections?.length ?? 0;
  const gesamt = body.gesamt;
  const info = body.error
    ? body.error
    : `ok (${aufgaben} Aufgaben, ${abschnitte} Abschnitte${body.vorschau ? `, Vorschau von ${gesamt?.aufgaben ?? '?'}` : ', VOLL'})`;
  console.log(`${label}: ${res.status} ${info}`);
  return { status: res.status, aufgaben, abschnitte, vorschau: body.vorschau === true, gesamt };
}

const auth = { Authorization: `Bearer ${token}` };

/* Was hier geprüft wird, hat sich geändert.
 *
 * Früher war ein ganzes Gebiet gratis und alles andere gab 403 zurück. Seit es
 * in JEDEM Thema einen kostenlosen Anfang gibt, antwortet der Server auch ohne
 * Kauf mit 200 — aber mit einem gekürzten Inhalt. Ein Test, der weiter auf 403
 * besteht, prüft damit ein Verhalten, das es nicht mehr gibt, und meldet FAIL
 * für den Normalfall.
 *
 * Die Eigenschaft, auf die es ankommt, ist eine andere: Ohne Kauf darf die
 * Antwort NICHT den ganzen Kurs enthalten. Genau das wird jetzt geprüft, und
 * zwar an der Antwort selbst, nicht am Statuscode.
 */
const PROBE_AUFGABEN = 5;
const PROBE_ABSCHNITTE = 3;

const ohneToken = await call('ohne Anmeldung, Analysis ', 'topic=analysis&level=gk', {});
const falscherToken = await call('gefälschter Token, LinAlg', 'topic=linalg&level=gk', { Authorization: 'Bearer abc.def.ghi' });
const ohneKaufGk = await call('angemeldet ohne Kauf, GK ', 'topic=linalg&level=gk', auth);
const ohneKaufLk = await call('angemeldet ohne Kauf, LK ', 'topic=stochastik&level=lk', auth);
const unsinn = await call('unbekanntes Thema        ', 'topic=hacking&level=gk', auth);

function istProbe(r) {
  return r.status === 200
    && r.vorschau === true
    && r.aufgaben === PROBE_AUFGABEN
    && r.abschnitte === PROBE_ABSCHNITTE
    // Es MUSS mehr geben, als geliefert wurde — sonst wäre nichts gekürzt.
    && typeof r.gesamt?.aufgaben === 'number'
    && r.gesamt.aufgaben > r.aufgaben;
}

const pruefungen = [
  ['ohne Anmeldung kommt nur die Probe', istProbe(ohneToken)],
  ['gefälschter Token wird abgewiesen', falscherToken.status === 401],
  ['ohne Kauf (GK) kommt nur die Probe', istProbe(ohneKaufGk)],
  ['ohne Kauf (LK) kommt nur die Probe', istProbe(ohneKaufLk)],
  ['unbekanntes Thema wird abgewiesen', unsinn.status === 400],
];

console.log('');
for (const [was, bestanden] of pruefungen) {
  console.log(`${bestanden ? 'OK  ' : 'FEHL'} ${was}`);
}
const ok = pruefungen.every(([, bestanden]) => bestanden);
console.log(`\nVERDICT: ${ok ? 'PASS — die Schranke greift.' : 'FAIL — bitte prüfen.'}`);
process.exit(ok ? 0 : 1);
