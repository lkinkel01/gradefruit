import { createClient } from '@supabase/supabase-js';
import {
  isContentLevel,
  isContentTopic,
  summaryFor,
  tasksFor,
} from '@/server/content';

// ===========================================================================
// Kursinhalte ausliefern — die einzige Stelle, an der Aufgaben, Lösungswege,
// Ergebnisse und Formeln den Server verlassen.
//
// Vorher lagen alle 133 Aufgaben samt Lösungen im JavaScript-Bündel und waren
// für jeden Besucher im Browser lesbar. Jetzt entscheidet der Server vor jeder
// Antwort: angemeldet? Kurs gekauft? Nur dann kommt der Inhalt.
//
// Der Zugang wird ausschließlich hier geprüft, nicht im Browser — die
// Oberfläche kann nur noch anzeigen, was sie tatsächlich bekommen hat.
// ===========================================================================
export const runtime = 'nodejs';
// Nutzerabhängige Antwort: niemals zwischenspeichern, sonst bekäme der
// nächste Besucher die Inhalte des vorigen.
export const dynamic = 'force-dynamic';

const COURSE_SLUG = { gk: 'mathe-gk', lk: 'mathe-lk' } as const;
// Analysis ist die kostenlose Probe. Alles andere ist kostenpflichtig.
const FREE_TOPIC = 'analysis';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, private',
    },
  });
}

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'server_misconfig', message: 'Die Datenbank-Verbindung fehlt auf dem Server.' }, 500);
  }

  const url = new URL(req.url);
  const topic = url.searchParams.get('topic') ?? '';
  const level = url.searchParams.get('level') ?? '';
  if (!isContentTopic(topic) || !isContentLevel(level)) {
    return json({ error: 'bad_request', message: 'Unbekanntes Thema oder unbekannte Kursstufe.' }, 400);
  }

  // Analysis ist die kostenlose Probe und muss auch ohne Konto lesbar sein —
  // die Startseite schickt Gäste über „Kostenlos testen" genau dorthin.
  if (topic === FREE_TOPIC) {
    return json({ tasks: tasksFor(topic, level), summary: summaryFor(topic, level) }, 200);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return json({ error: 'unauthorized', message: 'Bitte melde dich an, um die Inhalte zu sehen.' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return json({ error: 'unauthorized', message: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' }, 401);
  }

  // Kaufprüfung. Die Abfrage läuft mit dem Token des Nutzers, greift also durch
  // die Zeilen-Sicherheit (RLS) nur auf dessen eigene Käufe zu.
  {
    // `purchases.course_id` ist die UUID aus `courses` — erst den Kurs über
    // seinen Slug auflösen, dann den Kauf dazu suchen.
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', COURSE_SLUG[level])
      .maybeSingle();

    if (courseError || !course) {
      return json({ error: 'lookup_failed', message: 'Dein Zugang konnte gerade nicht geprüft werden. Bitte lade die Seite neu.' }, 503);
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('status')
      .eq('course_id', course.id)
      .maybeSingle();

    if (purchaseError) {
      return json({ error: 'lookup_failed', message: 'Dein Zugang konnte gerade nicht geprüft werden. Bitte lade die Seite neu.' }, 503);
    }
    if (purchase?.status !== 'active') {
      return json({
        error: 'locked',
        message: level === 'lk'
          ? 'Für dieses Thema brauchst du den Leistungskurs.'
          : 'Für dieses Thema brauchst du den Grundkurs.',
      }, 403);
    }
  }

  return json({ tasks: tasksFor(topic, level), summary: summaryFor(topic, level) }, 200);
}
