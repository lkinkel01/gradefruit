// Wegwerf-Testkonto für UI-Tests anlegen (siehe CLAUDE.md → Verifikation).
//
// Aufruf:   node --env-file=.env.local scripts/create-test-user.mjs <zweck>
// Beispiel: node --env-file=.env.local scripts/create-test-user.mjs sprint11
//
// Gibt E-Mail und generiertes Passwort aus (nur Test-Fixture, kein echtes
// Konto). Danach IMMER wieder löschen:
//           node --env-file=.env.local scripts/delete-test-user.mjs <zweck>
import { createClient } from '@supabase/supabase-js';

const zweck = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[a-z0-9-]{2,30}$/.test(zweck)) {
  console.error('Bitte einen Zweck angeben, z. B.: node --env-file=.env.local scripts/create-test-user.mjs sprint11');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Env fehlt – mit  node --env-file=.env.local …  starten.');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const email = `gradefruit.${zweck}.test@gmail.com`;
const password = 'gf-test-' + Math.random().toString(36).slice(2, 10);

// Rest eines früheren Laufs mit gleichem Zweck zuerst entfernen
const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const existing = (list?.users ?? []).find(u => u.email === email);
if (existing) await admin.auth.admin.deleteUser(existing.id);

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: 'Test Konto' },
});
if (error) {
  console.error('FEHLER:', error.message);
  process.exit(1);
}
console.log('Testkonto angelegt:', data.user.id);
console.log('EMAIL=' + email);
console.log('PASSWORD=' + password);
console.log('Nach dem Test löschen:  node --env-file=.env.local scripts/delete-test-user.mjs ' + zweck);
