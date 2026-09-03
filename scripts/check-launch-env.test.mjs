import assert from 'node:assert/strict';
import { formatiereErgebnis, pruefeLaunchUmgebung } from './check-launch-env.mjs';

const liveKey = ['sk', 'live', 'nur-ein-testwert'].join('_');
const guteUmgebung = {
  NEXT_PUBLIC_SITE_URL: 'https://www.gradefruit.de',
  NEXT_PUBLIC_SUPABASE_URL: 'https://workspace.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'oeffentlich-nur-ein-testwert-1234567890',
  SUPABASE_SERVICE_ROLE_KEY: 'serverseitig-nur-ein-testwert-1234567890',
  ANTHROPIC_API_KEY: 'anthropic-nur-ein-testwert-1234567890',
  STRIPE_SECRET_KEY: liveKey,
  STRIPE_WEBHOOK_SECRET: 'whsec_nur_ein_testwert',
  STRIPE_PRICE_ONE_TIME: 'price_gk_testwert',
  STRIPE_PRICE_LK_ONE_TIME: 'price_lk_testwert',
  CRON_SECRET: 'c'.repeat(40),
};

assert.deepEqual(pruefeLaunchUmgebung(guteUmgebung, { production: true }), []);

const unsichereUmgebung = {
  ...guteUmgebung,
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  STRIPE_SECRET_KEY: ['sk', 'test', 'nur-ein-testwert'].join('_'),
  STRIPE_PRICE_LK_ONE_TIME: '',
  CRON_SECRET: 'zu-kurz',
};
const fehler = pruefeLaunchUmgebung(unsichereUmgebung, { production: true });
assert.deepEqual(
  new Set(fehler.map(fund => fund.name)),
  new Set(['NEXT_PUBLIC_SITE_URL', 'STRIPE_SECRET_KEY', 'STRIPE_PRICE_LK_ONE_TIME', 'CRON_SECRET']),
);

const ausgabe = formatiereErgebnis(fehler, { production: true }).join('\n');
for (const geheimnis of Object.values(unsichereUmgebung)) {
  if (geheimnis) assert.equal(ausgabe.includes(geheimnis), false, 'Ausgabe enthält einen Konfigurationswert');
}

console.log('Launch-Konfigurationscheck: 2 Szenarien bestanden, keine Werte ausgegeben.');
