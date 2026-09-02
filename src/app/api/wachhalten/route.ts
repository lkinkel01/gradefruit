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
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ ok: false, grund: 'datenbank' }, { status: 503 });
    }
    return NextResponse.json({ ok: true, lektionen: count ?? 0 });
  } catch {
    return NextResponse.json({ ok: false, grund: 'unerreichbar' }, { status: 503 });
  }
}
