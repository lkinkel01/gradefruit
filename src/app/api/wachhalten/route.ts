import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

/**
 * Hält die Datenbank wach.
 *
 * Supabase pausiert Projekte im kostenlosen Tarif nach längerer Ruhe. Passiert
 * das, ist die App für alle tot: keine Anmeldung, keine Registrierung, keine
 * Inhalte. Genau das ist am 04.08.2026 eingetreten.
 *
 * Ein Vercel-Cron ruft diese Route täglich auf und stellt genau eine winzige
 * Abfrage. Das zählt als Aktivität und kostet nichts.
 *
 * WICHTIG, damit niemand sich darauf verlässt: Das ist ein Notnagel gegen das
 * Einschlafen, kein Ersatz für einen bezahlten Tarif. Sobald zahlende Schüler
 * am Kurs hängen, gehört das Projekt auf einen Tarif, der gar nicht erst
 * pausiert.
 *
 * Die Antwort enthält bewusst keine Inhalte — nur, ob die Datenbank antwortet.
 *
 * Geschützt über `CRON_SECRET`, das Vercel beim Cron-Aufruf mitschickt. Fehlt
 * die Variable, läuft der Weckruf weiter und meldet `ungeschuetzt: true` —
 * siehe Begründung unten in `GET`.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = req.headers.get('authorization');

  // Ist ein Geheimnis hinterlegt, gilt es — dann kommt nur Vercels Cron durch.
  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Fehlt das Geheimnis, wird die Route NICHT dichtgemacht, sondern läuft
  // ungeschützt weiter und sagt es.
  //
  // Der Grund ist die Abwägung dahinter: Wer hier ohne Geheimnis abweist,
  // beendet bei einer vergessenen Umgebungsvariablen still den täglichen
  // Weckruf. Supabase pausiert dann nach einer Woche Ruhe, und die ganze Seite
  // ist tot — genau das ist am 04.08.2026 passiert. Dagegen steht ein
  // Endpunkt, der eine einzige Zählabfrage macht und keine Inhalte
  // herausgibt. Ein toter Kurs wiegt schwerer als eine gezählte Zeile.
  //
  // Vergessen wird das trotzdem nicht: `npm run check:launch-env` verlangt
  // CRON_SECRET vor einem Produktionsdeployment, und die Antwort unten trägt
  // die Warnung sichtbar mit.
  const ungeschuetzt = !cronSecret;
  if (ungeschuetzt) {
    console.warn('Gradefruit: /api/wachhalten läuft ohne CRON_SECRET — bitte in Vercel setzen.');
  }

  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ ok: false, grund: 'datenbank' }, { status: 503 });
    }
    return NextResponse.json({ ok: true, lektionen: count ?? 0, ...(ungeschuetzt ? { ungeschuetzt: true } : {}) });
  } catch {
    return NextResponse.json({ ok: false, grund: 'unerreichbar' }, { status: 503 });
  }
}
