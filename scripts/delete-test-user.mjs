// Wegwerf-Testkonto nach UI-Tests wieder löschen (Gegenstück zu
// create-test-user.mjs; siehe CLAUDE.md → Verifikation).
//
// Aufruf:   node --env-file=.env.local scripts/delete-test-user.mjs <zweck>
import { createClient } from '@supabase/supabase-js';

const zweck = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[a-z0-9-]{2,30}$/.test(zweck)) {
  console.error('Bitte den Zweck des Testkontos angeben, z. B.: node --env-file=.env.local scripts/delete-test-user.mjs sprint11');
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

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const user = (list?.users ?? []).find(u => u.email === email);
if (!user) {
  console.log('Nicht gefunden – nichts zu tun:', email);
  process.exit(0);
}
const { error } = await admin.auth.admin.deleteUser(user.id);
if (error) {
  console.error('FEHLER:', error.message);
  process.exit(1);
}
console.log('Testkonto gelöscht:', email);
