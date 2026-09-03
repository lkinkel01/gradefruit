import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Konto endgültig löschen. Läuft server-seitig, weil das Löschen eines
// Nutzers Administratorrechte braucht — der Browser darf das nie selbst.
// Reihenfolge ist wichtig: erst laufende Abos bei Stripe beenden, damit
// niemand nach dem Löschen weiter abgebucht wird, dann den Nutzer entfernen
// (Käufe und Fortschritt hängen per ON DELETE CASCADE daran).
export const runtime = 'nodejs';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'server_misconfig', message: 'Die Datenbank-Verbindung fehlt auf dem Server.' }, 500);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return json({ error: 'unauthorized', message: 'Bitte melde dich an.' }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'unauthorized', message: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' }, 401);
  }
  const user = userData.user;

  const admin = createAdminClient();

  // 1) Laufende Abos beenden. Schlägt das fehl, wird NICHT gelöscht — sonst
  //    liefe die Abbuchung weiter, ohne dass jemand sie stoppen könnte.
  const { data: purchases, error: purchasesError } = await admin
    .from('purchases')
    .select('stripe_subscription_id, status')
    .eq('user_id', user.id);

  if (purchasesError) {
    return json({
      error: 'database_error',
      message: 'Deine Käufe konnten nicht sicher geprüft werden. Das Konto wurde nicht gelöscht.',
    }, 500);
  }

  const subscriptions = (purchases ?? [])
    .map(p => p.stripe_subscription_id as string | null)
    .filter((id): id is string => !!id);

  if (subscriptions.length > 0) {
    if (!process.env.STRIPE_SECRET_KEY) {
      return json({
        error: 'subscription_active',
        message: 'Dein Abo kann gerade nicht beendet werden. Bitte kündige es zuerst über „Abo verwalten“.',
      }, 409);
    }
    const stripe = getStripe();
    for (const id of subscriptions) {
      try {
        await stripe.subscriptions.cancel(id);
      } catch (error) {
        const code = (error as { code?: string })?.code;
        // Bereits gekündigt oder nicht mehr vorhanden ist unkritisch.
        if (code !== 'resource_missing') {
          return json({
            error: 'subscription_cancel_failed',
            message: 'Dein Abo konnte nicht beendet werden. Bitte kündige es zuerst über „Abo verwalten“ und versuche es dann erneut.',
          }, 409);
        }
      }
    }
  }

  // 2) Nutzer löschen. Käufe, Fortschritt und Geräte-Marker hängen per
  //    Fremdschlüssel mit ON DELETE CASCADE daran und verschwinden mit.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return json({
      error: 'delete_failed',
      message: 'Das Konto konnte nicht gelöscht werden. Bitte versuche es später noch einmal.',
    }, 500);
  }

  return json({ ok: true }, 200);
}
