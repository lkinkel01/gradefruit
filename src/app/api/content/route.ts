import { createClient } from '@supabase/supabase-js';
import { PROBE_ABSCHNITTE, PROBE_AUFGABEN } from '@/lib/probe';
import {
  isContentLevel,
  isContentTopic,
  summaryFor,
  tasksFor,
  type ContentLevel,
  type ContentTopic,
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

/**
 * Die kostenlose Probe.
 *
 * Früher war ein ganzes Thema frei (Analysis) und der Rest gesperrt. Wer
 * hereinschaute, sah damit sehr viel von einem Gebiet und nichts von den
 * anderen beiden. Jetzt gibt es überall denselben Anfang: ein paar
 * Abschnitte der Zusammenfassung und ein paar Aufgaben, in jedem Thema und
 * auf beiden Kursstufen.
 *
 * Entscheidend ist, dass die Kürzung HIER passiert. Der Browser bekommt den
 * Rest gar nicht erst — die Bezahlschranke bleibt eine echte Grenze und wird
 * nicht nur ausgeblendet.
 */
function probeVon(topic: ContentTopic, level: ContentLevel) {
  const alleAufgaben = tasksFor(topic, level);
  const ganzeZusammenfassung = summaryFor(topic, level);
  return {
    tasks: alleAufgaben.slice(0, PROBE_AUFGABEN),
    summary: { sections: ganzeZusammenfassung.sections.slice(0, PROBE_ABSCHNITTE) },
    vorschau: true,
    gesamt: {
      aufgaben: alleAufgaben.length,
      abschnitte: ganzeZusammenfassung.sections.length,
    },
  };
}

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

  // Ohne Konto gibt es die Probe — zu jedem Thema, nicht nur zu einem.
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return json(probeVon(topic, level), 200);
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
    // Angemeldet, aber ohne Kauf: ebenfalls die Probe. Eine Sperrseite hätte
    // nichts gezeigt; so sieht man von jedem Thema den Anfang und weiß, was
    // man kauft.
    if (purchase?.status !== 'active') {
      return json(probeVon(topic, level), 200);
    }
  }

  return json({ tasks: tasksFor(topic, level), summary: summaryFor(topic, level) }, 200);
}
