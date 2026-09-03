import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Anmeldung mit E-Mail ODER Benutzername.
//
// WARUM ÜBER DEN SERVER: Supabase kennt beim Anmelden nur E-Mail-Adressen. Ein
// Benutzername muss also erst in eine Adresse übersetzt werden — und diese
// Übersetzung darf niemals im Browser stattfinden. Eine Route, die zu einem
// Namen die Adresse zurückgibt, wäre eine Maschine zum Absammeln von
// E-Mail-Adressen: Namen durchprobieren, Adressen einsammeln.
//
// Deshalb passiert hier alles in einem Zug: nachschlagen, anmelden, und nach
// außen geht nur die fertige Sitzung. Ob es den Namen überhaupt gibt, verrät
// die Antwort nicht — falscher Name und falsches Passwort sehen identisch aus.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

// Eine einzige Fehlermeldung für alle Fälle. Jede Unterscheidung („Benutzer
// unbekannt" vs. „Passwort falsch") wäre eine Auskunft darüber, welche Konten
// existieren.
const FEHLER = { error: 'invalid_credentials', message: 'Anmeldedaten stimmen nicht.' };
const MAX_KENNUNG_CHARS = 254;
const MAX_PASSWORT_CHARS = 1_024;

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return json({ error: 'server_misconfig', message: 'Die Anmeldung ist auf dem Server nicht eingerichtet.' }, 500);
  }

  let kennung = '';
  let passwort = '';
  try {
    const body = await req.json();
    kennung = typeof body?.kennung === 'string' ? body.kennung.trim() : '';
    passwort = typeof body?.passwort === 'string' ? body.passwort : '';
  } catch {
    return json({ error: 'bad_request', message: 'Anfrage konnte nicht gelesen werden.' }, 400);
  }
  if (
    !kennung ||
    !passwort ||
    kennung.length > MAX_KENNUNG_CHARS ||
    passwort.length > MAX_PASSWORT_CHARS
  ) {
    return json(FEHLER, 400);
  }

  // Das @ entscheidet. Benutzernamen dürfen keins enthalten (Prüfregel in
  // supabase/username.sql), damit diese Unterscheidung eindeutig bleibt.
  let email = kennung;
  if (!kennung.includes('@')) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from('users')
        .select('email')
        .ilike('username', kennung)
        .maybeSingle();
      // Kein Treffer: trotzdem die gleiche Antwort wie bei falschem Passwort.
      if (error || !data?.email) return json(FEHLER, 400);
      email = data.email;
    } catch {
      return json({ error: 'server_misconfig', message: 'Die Anmeldung ist auf dem Server nicht eingerichtet.' }, 500);
    }
  }

  // Bewusst mit dem öffentlichen Schlüssel: Das Passwort soll geprüft werden,
  // nicht umgangen. Der Service-Role-Schlüssel könnte eine Sitzung ohne
  // Passwort ausstellen — genau das darf hier nicht passieren.
  const auth = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.signInWithPassword({ email, password: passwort });

  if (error || !data.session) {
    if (error && /email not confirmed/i.test(error.message)) {
      return json(
        { error: 'email_not_confirmed', message: 'Bitte bestätige zuerst deine E-Mail – der Link ist in deinem Postfach.' },
        400,
      );
    }
    return json(FEHLER, 400);
  }

  // Nur die Sitzung geht zurück, nie die aufgelöste Adresse. Der Browser setzt
  // sie anschließend selbst — dabei entstehen dieselben Cookies wie bei einer
  // gewöhnlichen Anmeldung.
  return json(
    { access_token: data.session.access_token, refresh_token: data.session.refresh_token },
    200,
  );
}
