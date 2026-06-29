import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Öffnet das gehostete Stripe-Kundenportal, in dem Nutzer ihr
// Monats-Abo ansehen, die Zahlungsart ändern oder kündigen können.
export const runtime = 'nodejs';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return json({ error: 'server_misconfig', message: 'Die Bezahlung ist auf dem Server noch nicht eingerichtet.' }, 500);
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'server_misconfig', message: 'Die Datenbank-Verbindung fehlt auf dem Server.' }, 500);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return json({ error: 'unauthorized', message: 'Bitte melde dich an.' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'unauthorized', message: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' }, 401);
  }
  const user = userData.user;

  try {
    const admin = createAdminClient();
    const stripe = getStripe();

    const { data: profile } = await admin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    const customerId = (profile?.stripe_customer_id as string | null) ?? null;
    if (!customerId) {
      return json({ error: 'no_customer', message: 'Für dein Konto gibt es noch kein Abo zum Verwalten.' }, 400);
    }

    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return json({ url: portal.url }, 200);
  } catch (err) {
    console.error('Portal-Fehler:', err);
    return json({ error: 'stripe_error', message: 'Das Kundenportal konnte nicht geöffnet werden. Bitte versuch es gleich noch einmal.' }, 500);
  }
}
