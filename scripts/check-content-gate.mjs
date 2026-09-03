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
  const tasks = Array.isArray(body.tasks) ? body.tasks.length : 0;
  console.log(`${label}: ${res.status} ${body.error ?? `ok (${tasks} Aufgaben)`}`);
  return res.status;
}

const auth = { Authorization: `Bearer ${token}` };
const results = {
  gratisOhneToken: await call('ohne Anmeldung, Analysis  ', 'topic=analysis&level=gk', {}),
  falscherToken: await call('gefälschter Token, LinAlg', 'topic=linalg&level=gk', { Authorization: 'Bearer abc.def.ghi' }),
  gratis: await call('angemeldet, Analysis GK  ', 'topic=analysis&level=gk', auth),
  bezahltGk: await call('angemeldet, LinAlg GK    ', 'topic=linalg&level=gk', auth),
  bezahltLk: await call('angemeldet, Stochastik LK', 'topic=stochastik&level=lk', auth),
  unsinn: await call('unbekanntes Thema        ', 'topic=hacking&level=gk', auth),
};

const ok =
  results.gratisOhneToken === 200 &&
  results.falscherToken === 401 &&
  results.gratis === 200 &&
  results.bezahltGk === 403 &&
  results.bezahltLk === 403 &&
  results.unsinn === 400;

console.log(`\nVERDICT: ${ok ? 'PASS — die Schranke greift.' : 'FAIL — bitte prüfen.'}`);
process.exit(ok ? 0 : 1);
