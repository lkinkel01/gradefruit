// Gradefruit – Webhook-Gesundheitscheck
//
// Prüft automatisch, ob ein Stripe-Kauf wirklich im Supabase `purchases`
// landet (= Vollzugang wird freigeschaltet). Gedacht zum Laufen im /loop.
//
// Aufruf (Secrets kommen aus .env.local, nie aus dem Code):
//   node --env-file=.env.local scripts/check-webhook.mjs
//
// Es werden NIE Secret-Werte ausgegeben – nur IDs, Zeiten und Status.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const need = ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.log('FEHLT in .env.local:', missing.join(', '));
  console.log('VERDICT: CONFIG_FEHLT');
  process.exit(0);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const short = (s) => (s ? String(s).slice(0, 10) + '…' : '–');
const when = (sec) => new Date(sec * 1000).toLocaleString('de-DE');

console.log('===== Gradefruit Webhook-Check =====');
console.log('Zeit:', new Date().toLocaleString('de-DE'));

// 1) Welche Webhook-Endpunkte sind bei Stripe konfiguriert?
let endpoints = { data: [] };
try {
  endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
} catch (e) {
  console.log('Stripe-Fehler (Endpunkte):', e.message);
  console.log('VERDICT: STRIPE_FEHLER');
  process.exit(0);
}
const ours = endpoints.data.filter((e) => /\/api\/stripe\/webhook/.test(e.url));
console.log(`\n-- Webhook-Endpunkte bei Stripe (${ours.length} auf /api/stripe/webhook) --`);
for (const e of ours) {
  console.log(`  • ${e.url}`);
  console.log(`    status=${e.status}  api_version=${e.api_version || '—'}  events=${(e.enabled_events || []).length}  id=${e.id}`);
}

// 2) Letzte checkout.session.completed-Events
let events = { data: [] };
try {
  events = await stripe.events.list({ limit: 30, type: 'checkout.session.completed' });
} catch (e) {
  console.log('Stripe-Fehler (Events):', e.message);
  console.log('VERDICT: STRIPE_FEHLER');
  process.exit(0);
}

// 3) Letzte Käufe in Supabase
const { data: purchases, error: pErr } = await supabase
  .from('purchases')
  .select('user_id, course_id, status, plan, stripe_checkout_session_id, purchased_at, updated_at')
  .order('purchased_at', { ascending: false })
  .limit(20);
if (pErr) {
  console.log('Supabase-Fehler:', pErr.message);
  console.log('VERDICT: SUPABASE_FEHLER');
  process.exit(0);
}

console.log(`\n-- Letzte Käufe in Supabase (${purchases.length}) --`);
for (const p of purchases.slice(0, 8)) {
  console.log(`  • user=${short(p.user_id)} course=${p.course_id} status=${p.status} plan=${p.plan} session=${short(p.stripe_checkout_session_id)} ${p.purchased_at}`);
}

// 4) Abgleich: hat jedes Checkout-Event eine passende purchases-Zeile?
//    Wichtig: Der Webhook macht ein upsert mit onConflict user_id+course_id.
//    D.h. kauft derselbe User denselben Kurs erneut, wird die stripe_checkout_session_id
//    der Zeile überschrieben. Ältere Sessions matchen dann nicht mehr per ID –
//    das ist KEIN Fehler. Darum werten wir zusätzlich „aktiver Zugang für user+kurs“.
const bySession = new Map(purchases.map((p) => [p.stripe_checkout_session_id, p]));
const TOL = 10 * 60 * 1000; // 10 Min Toleranz für „kurz danach freigeschaltet“

function classify(ev) {
  const s = ev.data.object;
  const uid = s.client_reference_id || s.metadata?.user_id || null;
  const cid = s.metadata?.course_id || null;
  const evMs = ev.created * 1000;
  const direct = bySession.get(s.id);
  if (direct && direct.status === 'active') return { mark: '✅', note: 'verarbeitet', uid };
  // Gleicher User+Kurs aktiv und kurz nach dem Event aktualisiert → später überschrieben, aber Zugang aktiv
  const superseded = purchases.find(
    (p) => p.status === 'active' && p.user_id === uid && (!cid || p.course_id === cid) && new Date(p.updated_at).getTime() >= evMs - TOL
  );
  if (superseded) return { mark: '☑️', note: 'überschrieben (Zugang aktiv)', uid };
  return { mark: '❌', note: 'KEINE aktive Zeile', uid };
}

console.log(`\n-- Abgleich der letzten Checkout-Events (${events.data.length}) --`);
const recent = events.data.slice(0, 8);
let latestOk = null;
for (let i = 0; i < recent.length; i++) {
  const ev = recent[i];
  const s = ev.data.object;
  const c = classify(ev);
  if (i === 0) latestOk = c.mark !== '❌';
  console.log(`  ${c.mark} ${when(ev.created)}  session=${short(s.id)}  user=${short(c.uid)}  pay=${s.payment_status}  → ${c.note}`);
}

// 5) Urteil
console.log('\n-- Ergebnis --');
if (events.data.length === 0) {
  console.log('Noch kein einziger checkout.session.completed gefunden.');
  console.log('→ Mach einen Test-Kauf (Stripe Testmodus), dann prüft der Loop erneut.');
  console.log('VERDICT: NOCH_KEIN_TESTKAUF');
} else if (latestOk) {
  console.log('Der letzte Test-Kauf wurde sauber verarbeitet und der Zugang freigeschaltet.');
  console.log('VERDICT: WEBHOOK_OK');
} else {
  console.log('Es gibt einen Checkout, aber dazu KEINE aktive purchases-Zeile.');
  console.log('→ Der Webhook kommt nicht durch. Häufigste Ursache: falsches/fehlendes');
  console.log('  STRIPE_WEBHOOK_SECRET in Vercel (muss das "Snapshot"-Secret sein) oder kein Redeploy.');
  console.log('VERDICT: WEBHOOK_KAPUTT');
}
