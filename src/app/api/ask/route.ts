import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Diese Route läuft auf dem Server (Node), nie im Browser.
// Der ANTHROPIC_API_KEY bleibt damit geheim.
export const runtime = 'nodejs';
export const maxDuration = 60;

// Modell laut Vorgabe – exakt diese Zeichenkette, kein Datum anhängen.
const MODEL = 'claude-sonnet-4-6';

// Maximale KI-Fragen pro Nutzer und Tag (lässt sich hier zentral ändern).
const DAILY_LIMIT = 30;

// Sicherheitsnetz gegen riesige Uploads (Base64-Länge).
// ~7 Mio. Zeichen entsprechen etwa 5 MB Datei.
const MAX_ATTACHMENT_CHARS = 7_000_000;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// ------------------------------------------------------------
// System-Prompt: der Charakter der KI (geduldiger Mathe-Coach)
// ------------------------------------------------------------
const SYSTEM_PROMPT = `Du bist „Gradefruit-Coach", ein geduldiger, motivierender Mathe-Nachhilfe-Lehrer. Du hilfst Schülerinnen und Schülern bei der Vorbereitung auf das schriftliche Mathe-Abitur in Hessen (Abitur 2027) – sowohl im Grundkurs als auch im Leistungskurs.

So arbeitest du:
- Du schreibst immer auf Deutsch und duzt die Lernenden („du").
- Dein Ton ist locker, freundlich und ermutigend – nie herablassend. Du baust auf, auch wenn jemand einen Fehler macht oder eine Frage ungeschickt stellt.
- Du erklärst Schritt für Schritt und in kleinen, klaren Häppchen. Lieber ein Gedanke pro Schritt als alles auf einmal.
- Du nutzt einfache Sprache und erklärst Fachbegriffe kurz, wenn sie vorkommen.
- Du triffst das passende Niveau: Bei Grundkurs-Fragen bleibst du beim Grundkurs-Stoff, bei Leistungskurs-Fragen darfst du tiefer gehen (z. B. mehr Beweis-Anteile, komplexere Analysis, Matrizen/Übergangsmatrizen). Orientiere dich am Niveau der Frage und der jeweiligen Aufgabe. Studiums-Stoff nur, wenn ausdrücklich gewünscht.

Wenn eine Frage unklar oder unvollständig ist:
- Rate wohlwollend, was gemeint sein könnte, und hilf trotzdem direkt weiter.
- Stelle höchstens eine kurze Rückfrage, und nur dann, wenn es ohne eine wichtige Information wirklich nicht geht.

Wenn ein Foto oder PDF mit einer Aufgabe oder einer Lösung hochgeladen wird:
- Lies sorgfältig, was dort steht bzw. gerechnet wurde.
- Gehe den Rechenweg Schritt für Schritt durch.
- Zeige genau, an welcher Stelle ein Fehler steckt, erkläre, warum es ein Fehler ist, und zeige den richtigen Schritt.
- Lobe ausdrücklich das, was schon richtig war.

Formatierung:
- Nutze kurze Absätze und – wenn sinnvoll – nummerierte Schritte.
- Schreibe Formeln gut lesbar in Textform (z. B. f'(x) = 2x + 3, Integral, Wurzel(2), x^2, usw.).
- Halte dich kurz, aber vollständig. Frag am Ende ruhig, ob noch etwas unklar ist.

Du beantwortest nur Fragen rund um Mathematik und das Lernen dafür. Bei themenfremden Fragen lenkst du freundlich zum Mathe-Lernen zurück.`;

// ------------------------------------------------------------
// Hilfstypen für den Request-Body vom Frontend
// ------------------------------------------------------------
interface HistoryItem {
  role: 'user' | 'ai';
  text: string;
}
interface Attachment {
  kind: 'image' | 'pdf';
  media_type: string;
  data: string; // Base64 (ohne "data:"-Präfix)
}
interface AskBody {
  question?: string;
  context?: string;
  snippet?: string;
  history?: HistoryItem[];
  attachment?: Attachment | null;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function POST(req: Request) {
  // 1) Server-Konfiguration prüfen
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      { error: 'server_misconfig', message: 'Der KI-Schlüssel fehlt auf dem Server.' },
      500,
    );
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(
      { error: 'server_misconfig', message: 'Die Datenbank-Verbindung fehlt auf dem Server.' },
      500,
    );
  }

  // 2) Anmelde-Token aus dem Header lesen
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  if (!token) {
    return json(
      { error: 'unauthorized', message: 'Bitte melde dich an, um die KI zu nutzen.' },
      401,
    );
  }

  // 3) Body lesen
  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return json({ error: 'bad_request', message: 'Ungültige Anfrage.' }, 400);
  }

  const { question, context, snippet, history, attachment } = body;

  // 4) Nutzer prüfen + Tageslimit verbrauchen (mit dem JWT des Nutzers,
  //    damit auth.uid() in der DB-Funktion funktioniert)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json(
      { error: 'unauthorized', message: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' },
      401,
    );
  }

  const { data: quota, error: quotaErr } = await supabase.rpc('consume_ai_quota', {
    daily_limit: DAILY_LIMIT,
  });
  if (quotaErr) {
    console.error('consume_ai_quota Fehler:', quotaErr.message);
    return json(
      {
        error: 'quota_error',
        message:
          'Das Tageslimit konnte nicht geprüft werden. Bitte stelle sicher, dass die Datei ai-rate-limit.sql in Supabase ausgeführt wurde.',
      },
      500,
    );
  }
  const q = (quota ?? {}) as { allowed?: boolean; remaining?: number; used?: number; limit?: number };
  if (!q.allowed) {
    return json(
      {
        error: 'rate_limited',
        message: `Du hast dein Tageslimit von ${q.limit ?? DAILY_LIMIT} KI-Fragen erreicht. Morgen geht es wieder weiter!`,
        limit: q.limit ?? DAILY_LIMIT,
        used: q.used ?? q.limit ?? DAILY_LIMIT,
      },
      429,
    );
  }

  // 5) Anhang prüfen (falls vorhanden)
  if (attachment?.data) {
    if (attachment.data.length > MAX_ATTACHMENT_CHARS) {
      return json(
        { error: 'too_large', message: 'Die Datei ist zu groß. Bitte nutze ein kleineres Foto oder PDF (max. ca. 5 MB).' },
        413,
      );
    }
    if (attachment.kind === 'image' && !ALLOWED_IMAGE_TYPES.includes(attachment.media_type as AllowedImageType)) {
      return json(
        { error: 'bad_request', message: 'Dieses Bildformat wird nicht unterstützt. Nutze JPG, PNG, GIF oder WebP.' },
        400,
      );
    }
  }

  // 6) Nachrichten für die KI zusammenbauen
  const messages: Anthropic.MessageParam[] = [];

  // frühere Nachrichten dieser Unterhaltung übernehmen
  for (const m of history ?? []) {
    if (!m?.text?.trim()) continue;
    messages.push({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text });
  }

  // neue Nutzer-Nachricht
  const userContent: Anthropic.ContentBlockParam[] = [];

  // Kontext (Thema/Aufgabe) nur am Anfang der Unterhaltung voranstellen
  if ((history?.length ?? 0) === 0) {
    const lines: string[] = [];
    if (context) lines.push(`Thema: ${context}`);
    if (snippet) lines.push(`Aktuelle Aufgabe: ${snippet}`);
    if (lines.length) userContent.push({ type: 'text', text: lines.join('\n') });
  }

  // optionaler Anhang (Foto oder PDF)
  if (attachment?.data) {
    if (attachment.kind === 'image') {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: attachment.media_type as AllowedImageType,
          data: attachment.data,
        },
      });
    } else if (attachment.kind === 'pdf') {
      userContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: attachment.data },
      });
    }
  }

  // die eigentliche Frage
  userContent.push({
    type: 'text',
    text: question?.trim() || 'Bitte erkläre mir das Schritt für Schritt.',
  });

  messages.push({ role: 'user', content: userContent });

  // 7) KI aufrufen und die Antwort als Text-Stream zurückgeben
  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      (async () => {
        try {
          const aiStream = client.messages.stream({
            model: MODEL,
            max_tokens: 8000,
            thinking: { type: 'adaptive' },
            output_config: { effort: 'medium' },
            system: [
              { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
            ],
            messages,
          });

          // Nur die sichtbare Text-Antwort weiterreichen (kein "Denken").
          aiStream.on('text', (delta: string) => {
            controller.enqueue(encoder.encode(delta));
          });

          await aiStream.finalMessage();
        } catch (err) {
          console.error('Anthropic-Stream-Fehler:', err);
          controller.enqueue(
            encoder.encode(
              '\n\nEntschuldigung, da ist gerade etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
            ),
          );
        } finally {
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
