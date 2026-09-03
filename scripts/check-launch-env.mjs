import { pathToFileURL } from 'node:url';

const REQUIRED = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ONE_TIME',
  'STRIPE_PRICE_LK_ONE_TIME',
  'CRON_SECRET',
];

const wert = (env, name) => typeof env[name] === 'string' ? env[name].trim() : '';

function urlPruefen(raw, { production, supabase = false }) {
  try {
    const url = new URL(raw);
    const lokal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (production && (url.protocol !== 'https:' || lokal)) {
      return 'muss im Produktionsmodus eine öffentliche HTTPS-URL sein';
    }
    if (!production && url.protocol !== 'https:' && !(url.protocol === 'http:' && lokal)) {
      return 'muss HTTPS verwenden; lokal ist HTTP nur für localhost erlaubt';
    }
    if (supabase && production && !url.hostname.endsWith('.supabase.co')) {
      return 'muss im Produktionsmodus auf das vorgesehene Supabase-Projekt zeigen';
    }
    return null;
  } catch {
    return 'ist keine gültige URL';
  }
}

/**
 * Prüft nur Struktur und offensichtliche Testkonfiguration. Kein Wert wird
 * zurückgegeben oder protokolliert; dadurch kann der Check gefahrlos in lokalen
 * und CI-Ausgaben laufen.
 */
export function pruefeLaunchUmgebung(env, { production = false } = {}) {
  const fehler = [];
  const melden = (name, grund) => fehler.push({ name, grund });

  for (const name of REQUIRED) {
    if (!wert(env, name)) melden(name, 'fehlt');
  }

  const siteUrl = wert(env, 'NEXT_PUBLIC_SITE_URL');
  if (siteUrl) {
    const grund = urlPruefen(siteUrl, { production });
    if (grund) melden('NEXT_PUBLIC_SITE_URL', grund);
  }

  const supabaseUrl = wert(env, 'NEXT_PUBLIC_SUPABASE_URL');
  if (supabaseUrl) {
    const grund = urlPruefen(supabaseUrl, { production, supabase: true });
    if (grund) melden('NEXT_PUBLIC_SUPABASE_URL', grund);
  }

  const anon = wert(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const service = wert(env, 'SUPABASE_SERVICE_ROLE_KEY');
  if (anon && anon.length < 20) melden('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'wirkt unvollständig');
  if (service && service.length < 20) melden('SUPABASE_SERVICE_ROLE_KEY', 'wirkt unvollständig');
  if (anon && service && anon === service) {
    melden('SUPABASE_SERVICE_ROLE_KEY', 'darf nicht dem öffentlichen Supabase-Schlüssel entsprechen');
  }

  const anthropic = wert(env, 'ANTHROPIC_API_KEY');
  if (anthropic && anthropic.length < 20) melden('ANTHROPIC_API_KEY', 'wirkt unvollständig');

  const stripe = wert(env, 'STRIPE_SECRET_KEY');
  if (stripe) {
    const erwarteterPraefix = production ? 'sk_live_' : 'sk_';
    if (!stripe.startsWith(erwarteterPraefix)) {
      melden('STRIPE_SECRET_KEY', production
        ? 'ist kein Stripe-Live-Schlüssel'
        : 'hat kein erwartetes Stripe-Schlüsselformat');
    }
  }

  const webhook = wert(env, 'STRIPE_WEBHOOK_SECRET');
  if (webhook && !webhook.startsWith('whsec_')) {
    melden('STRIPE_WEBHOOK_SECRET', 'hat kein erwartetes Webhook-Secret-Format');
  }

  for (const name of ['STRIPE_PRICE_ONE_TIME', 'STRIPE_PRICE_LK_ONE_TIME']) {
    const price = wert(env, name);
    if (price && !price.startsWith('price_')) melden(name, 'hat kein erwartetes Stripe-Preisformat');
  }

  const cron = wert(env, 'CRON_SECRET');
  if (cron && cron.length < 32) melden('CRON_SECRET', 'muss mindestens 32 Zeichen lang sein');

  return fehler;
}

export function formatiereErgebnis(fehler, { production = false } = {}) {
  const modus = production ? 'Produktion' : 'lokale Entwicklung';
  if (fehler.length === 0) {
    return [`Launch-Konfiguration (${modus}): PASS`, 'Alle erforderlichen Werte sind vorhanden und plausibel formatiert.'];
  }
  return [
    `Launch-Konfiguration (${modus}): FAIL`,
    ...fehler.map(({ name, grund }) => `- ${name}: ${grund}`),
    'Es wurden keine Konfigurationswerte ausgegeben.',
  ];
}

const direktGestartet = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (direktGestartet) {
  const production = process.argv.includes('--production');
  const fehler = pruefeLaunchUmgebung(process.env, { production });
  formatiereErgebnis(fehler, { production }).forEach(zeile => console.log(zeile));
  if (fehler.length > 0) process.exitCode = 1;
}
